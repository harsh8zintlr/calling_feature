import { getCallLogs } from "./callerDeskApi";

interface CallRoutingResult {
  shouldRedirect: boolean;
  agentNumber?: string;
  agentName?: string;
  lastCallDate?: string;
}

/**
 * Checks if an incoming call should be redirected to a specific agent
 * based on previous outgoing call history
 */
export async function checkCallRouting(
  authCode: string,
  incomingNumber: string
): Promise<CallRoutingResult> {
  try {
    // Fetch outgoing call logs for this number
    const callLogs = await getCallLogs(authCode, {
      Flow_type: "WEBOBD", // Outgoing calls only
      per_page: 100, // Check more records
    });

    if (callLogs.type !== "success" || !callLogs.result) {
      return { shouldRedirect: false };
    }

    // Find all outgoing calls to this number
    const outgoingCallsToNumber = callLogs.result.filter(
      (call) => call.caller_num === incomingNumber
    );

    if (outgoingCallsToNumber.length === 0) {
      return { shouldRedirect: false };
    }

    // Sort by most recent call first
    outgoingCallsToNumber.sort(
      (a, b) =>
        new Date(b.startdatetime).getTime() -
        new Date(a.startdatetime).getTime()
    );

    // Get the agent who most recently called this number
    const mostRecentCall = outgoingCallsToNumber[0];

    return {
      shouldRedirect: true,
      agentNumber: mostRecentCall.member_num,
      agentName: mostRecentCall.member_name,
      lastCallDate: mostRecentCall.startdatetime,
    };
  } catch (error) {
    console.error("Error checking call routing:", error);
    return { shouldRedirect: false };
  }
}

/**
 * Redirects an incoming call to a specific agent
 */
export async function redirectCallToAgent(
  authCode: string,
  incomingNumber: string,
  agentNumber: string,
  deskphone: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Use the click-to-call API to connect the incoming call to the agent
    const queryParams = new URLSearchParams({
      authcode: authCode,
      calling_party_a: agentNumber, // Agent number
      calling_party_b: incomingNumber, // Incoming caller
      deskphone: deskphone,
      call_from_did: "1",
    });

    const response = await fetch(
      `https://app.callerdesk.io/api/click_to_call_v2?${queryParams.toString()}`
    );

    const result = await response.json();

    return {
      success: result.type === "success",
      message: result.message || "Call redirected successfully",
    };
  } catch (error) {
    console.error("Error redirecting call:", error);
    return {
      success: false,
      message: "Failed to redirect call",
    };
  }
}

/**
 * Main function to handle incoming call routing
 * This should be called when an incoming call is detected
 */
export async function handleIncomingCall(
  authCode: string,
  incomingNumber: string,
  deskphone: string
): Promise<{
  routed: boolean;
  routedTo?: string;
  agentName?: string;
  message: string;
}> {
  // Check if this number was previously called by an agent
  const routingCheck = await checkCallRouting(authCode, incomingNumber);

  if (routingCheck.shouldRedirect && routingCheck.agentNumber) {
    // Redirect to the agent who previously called this number
    const redirectResult = await redirectCallToAgent(
      authCode,
      incomingNumber,
      routingCheck.agentNumber,
      deskphone
    );

    if (redirectResult.success) {
      return {
        routed: true,
        routedTo: routingCheck.agentNumber,
        agentName: routingCheck.agentName,
        message: `Call redirected to ${
          routingCheck.agentName || routingCheck.agentNumber
        }`,
      };
    }
  }

  // No redirect needed or redirect failed - let call go normally
  return {
    routed: false,
    message: "Call proceeding normally",
  };
}

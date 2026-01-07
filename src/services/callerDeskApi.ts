const BASE_URL = "https://app.callerdesk.io/api";

interface ApiResponse<T = any> {
  type: "success" | "error";
  message?: string;
  [key: string]: any;
}

async function apiCall<T>(
  endpoint: string,
  authCode: string,
  options?: {
    method?: "GET" | "POST";
    body?: Record<string, any>;
    params?: Record<string, string>;
  }
): Promise<T> {
  const { method = "POST", body, params } = options || {};

  let url = `${BASE_URL}/${endpoint}`;

  if (method === "GET" && params) {
    const searchParams = new URLSearchParams({ authcode: authCode, ...params });
    url += `?${searchParams.toString()}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (method === "POST") {
    const formData = new URLSearchParams();
    formData.append("authcode", authCode);
    if (body) {
      Object.entries(body).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    fetchOptions.body = formData.toString();
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  const json = await response.json();
  console.log(`API RESPONSE [${endpoint}] 👉`, json);

  return json;
}

// Dashboard & Summary
export async function getDashboardSummary(authCode: string) {
  return apiCall<{
    type: string;
    total_calls?: number;
    answered_calls?: number;
    missed_calls?: number;
    total_members?: number;
    balance?: string;
  }>("dashboard_summary", authCode);
}

export async function getProfileBalance(authCode: string) {
  return apiCall<{
    type: string;
    profile?: {
      account_id: string;
      company_name: string;
      email: string;
      mobile: string;
    };
    balance?: string;
  }>("profile_billing_v2", authCode);
}

// Call Logs
export async function getCallLogs(
  authCode: string,
  filters?: {
    start_date?: string;
    end_date?: string;
    current_page?: number;
    per_page?: number;
    callresult?: string;
    Flow_type?: string;
  }
) {
  return apiCall<{
    type: string;
    result: Array<{
      id: string;
      sid_id: string;
      file: string;
      deskphone: string;
      caller_name: string;
      is_contact: number;
      member_name: string;
      caller_num: string;
      coin_deducted: string;
      member_num: string;
      call_date: string;
      startdatetime: string;
      enddatetime: string;
      total_duration: string;
      talk_duration: string;
      ringing_duration: number;
      circle: string;
      key_pressed: string;
      block: string;
      callresult: string;
      callstatus: string;
      group_name: string;
      Flow_type: string;
    }>;
    current_page: number;
    total: number;
    answered_total: string;
    noanswer_total: string;
    voicemail: number;
  }>("call_list_v2", authCode, { body: filters });
}

// Live Calls
export async function getLiveCalls(authCode: string) {
  return apiCall<{
    type: string;
    total_live_calls: string;
    live_calls: Array<{
      msisdn: string;
      entrydate: string;
      member_num: string;
      callstatus: string;
      lastupdatedate: string;
      did_num: string;
      sid_id: string;
      channel: string;
      deskphone: string;
      member_name: string;
      group_name: string;
    }>;
  }>("live_call_v2", authCode, { method: "GET", params: {} });
}

// Click to Call
export async function initiateCall(
  authCode: string,
  params: {
    calling_party_a: string;
    calling_party_b: string;
    deskphone: string;
  }
) {
  const queryParams = new URLSearchParams({
    authcode: authCode,
    calling_party_a: params.calling_party_a,
    calling_party_b: params.calling_party_b,
    deskphone: params.deskphone,
    call_from_did: "1",
  });

  const response = await fetch(
    `${BASE_URL}/click_to_call_v2?${queryParams.toString()}`
  );
  return response.json();
}

// Members
export async function getMemberList(authCode: string) {
  return apiCall<{
    type: string;
    getmember: Array<{
      member_id: string;
      member_name: string;
      member_email: string;
      member_num: string;
      password: string;
      access: string;
      status: string;
      type: string;
      agent_extn: string;
    }>;
    total_record: number;
  }>("getmemberlist_V2", authCode);
}

export async function addMember(
  authCode: string,
  data: {
    member_name: string;
    member_num: string;
    access?: number;
    active?: number;
  }
) {
  return apiCall("addmember_v2", authCode, {
    body: {
      member_name: data.member_name,
      member_num: data.member_num,
      access: data.access || 2,
      active: data.active || 1,
    },
  });
}

export async function updateMember(
  authCode: string,
  data: {
    member_id: string;
    member_num: string;
    member_name?: string;
    status?: number;
    access?: number;
  }
) {
  return apiCall("updatemember_v2", authCode, { body: data });
}

export async function deleteMember(authCode: string, memberId: string) {
  return apiCall("deletemember_v2", authCode, {
    body: { member_id: memberId },
  });
}

// Call Groups
export async function getCallGroups(authCode: string) {
  return apiCall<{
    type: string;
    grouplist: Array<{
      group_id: string;
      group_name: string;
      call_strategy: string;
      is_sticky: string;
      is_multi_sticky: string;
      group_owner_name: string | null;
      extension: string;
      deskphone_id: string;
      groupmember_count: number;
    }>;
    total: number;
  }>("getgrouplist_v2", authCode);
}

export async function createCallGroup(
  authCode: string,
  data: {
    group_name: string;
    deskphone_id: string;
  }
) {
  return apiCall("createcallgroup", authCode, { body: data });
}

export async function updateCallGroup(
  authCode: string,
  groupId: string,
  data: {
    group_name: string;
    deskphone_id: string;
  }
) {
  return apiCall("updategroup_v2", authCode, {
    body: {
      group_id: groupId,
      ...data,
    },
  });
}

export async function deleteCallGroup(authCode: string, groupId: string) {
  return apiCall("deletegroup", authCode, { body: { group_id: groupId } });
}

// Group Members
export async function getGroupMembers(authCode: string, groupId: string) {
  return apiCall<{
    type: string;
    group_user_live: Array<{
      group_member_id: string;
      member_id: string;
      member_name: string;
      member_email: string;
      member_num: string;
      group_member_status: string;
      starttime: string;
      endtime: string;
      weekdays: string;
      priority: string;
      member_status: string;
    }>;
    group_user_nonlive: Array<{
      member_id: string;
      member_name: string;
      member_email: string;
      member_num: string;
      access: string;
      status: string;
    }>;
    grouplist: Array<{
      group_id: string;
      group_name: string;
      call_strategy: string;
      is_sticky: string;
      is_multi_sticky: string;
      group_owner_name: string | null;
      extension: string;
      did_no: string;
      desk_phone: string;
      groupmember_count: number;
    }>;
  }>("getgroupbyid_v2", authCode, {
    body: { group_id: groupId },
  });
}

export async function addGroupMember(
  authCode: string,
  groupId: string,
  data: {
    member_id: string;
  }
) {
  return apiCall("updategroup_v2", authCode, {
    body: {
      group_id: groupId,
      member_id: data.member_id,
    },
  });
}

export async function removeGroupMember(
  authCode: string,
  groupMemberId: string
) {
  return apiCall("delete_user_call_group", authCode, {
    body: {
      id: groupMemberId,
    },
  });
}

// Contacts
export async function getContacts(
  authCode: string,
  filters?: {
    current_page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
  }
) {
  return apiCall<{
    type: string;
    result: Array<{
      contact_id: string;
      contact_num: string;
      contact_name: string;
      contact_email: string;
      contact_address: string;
      member_name: string | null;
      contact_status: string;
      contact_comment: string;
      contact_savedate: string;
      contact_followupdate: string | null;
      deskphone: string;
    }>;
    total: number;
  }>("contact_list_v2", authCode, { body: filters });
}

export async function addContact(
  authCode: string,
  data: {
    contact_num: string;
    contact_name: string;
    contact_email?: string;
    contact_address?: string;
  }
) {
  return apiCall("savecontact_v2", authCode, { body: data });
}

export async function deleteContact(authCode: string, contactNum: string) {
  return apiCall("deleteContact", authCode, {
    body: { contact_num: contactNum },
  });
}

// Block/Unblock
export async function blockNumber(authCode: string, callerNumber: string) {
  return apiCall("block_number", authCode, {
    body: { caller_number: callerNumber },
  });
}

export async function unblockNumber(authCode: string, callerNumber: string) {
  return apiCall("unblock_number", authCode, {
    body: { caller_number: callerNumber },
  });
}

// IVR Numbers
export async function getIVRNumbers(authCode: string) {
  return apiCall<{
    type: string;
    getdeskphone: Array<{
      did_id: string;
      did_num: string;
      deskphone: string;
    }>;
  }>("getdeskphone_v2", authCode);
}

// Member Analysis
export async function getMemberAnalysis(authCode: string) {
  return apiCall<{
    type: string;
    result: Array<{
      member_id: string;
      member_name: string;
      total_calls: number;
      answered_calls: number;
      missed_calls: number;
      avg_talk_time: string;
    }>;
  }>("member_analysis_report", authCode);
}

// Notifications
export async function getNotifications(authCode: string) {
  return apiCall<{
    type: string;
    result: Array<{
      id: string;
      title: string;
      message: string;
      created_at: string;
      is_read: number;
    }>;
  }>("notification_list", authCode);
}

"use client";

import { useCallback, useEffect, useState } from "react";

type PendingProfileRequest = {
  id: string;
  kind: "CORRECTION"|"REMOVAL"|"CLAIM";
  subjectKind: "COMPANY"|"PROFESSIONAL"|"EDITOR";
  subjectSlug: string;
  description: string;
  sourceUrl: string | null;
  contactEmail: string | null;
  state: "PENDING"|"NEEDS_EVIDENCE"|"CLOSED"|"DECLINED";
  submittedAt: string;
  expiresAt: string;
  reviewedAt: string | null;
  decisionNote: string | null;
};

const api="/api/v1/profile-network/editorial/requests";

export function ProfileRequestInbox() {
  const [requests,setRequests]=useState<PendingProfileRequest[]>([]);
  const [notice,setNotice]=useState("");
  const [permission,setPermission]=useState<boolean|null>(null);
  const [busy,setBusy]=useState(false);
  const [notes,setNotes]=useState<Record<string,string>>({});

  const reload=useCallback(async () => {
    try {
      const response=await fetch(api,{credentials:"same-origin",cache:"no-store"});
      if(!response.ok){ setPermission(false);setRequests([]);setNotice(`Moderation access not available (${response.status}).`);return; }
      const data:unknown=await response.json();
      const result=data && typeof data==="object" && "result" in data ? data.result:null;
      setRequests(Array.isArray(result) ? result as PendingProfileRequest[]:[]);
      setPermission(true);
    }catch{ setPermission(false);setNotice("The private request inbox could not be loaded."); }
  },[]);

  useEffect(()=>{void reload();},[reload]);

  async function decide(item:PendingProfileRequest,decision:"NEEDS_EVIDENCE"|"CLOSED"|"DECLINED"){
    const reason=(notes[item.id]||"").trim();
    if(reason.length<8){setNotice("A decision reason of at least 8 characters is required.");return;}
    setBusy(true);setNotice("");
    try{
      const response=await fetch(`${api}/${item.id}/decision`,{
        method:"POST",credentials:"same-origin",
        headers:{"Content-Type":"application/json","Idempotency-Key":`pnrequest-${crypto.randomUUID()}`},
        body:JSON.stringify({decision,reason}),
      });
      if(!response.ok){setNotice(`Moderation decision was not completed (${response.status}).`);return;}
      await reload();
      setNotice(`Request marked ${decision.toLowerCase().replaceAll("_"," ")}. This does not change any public profile or verification state.`);
    }catch{setNotice("The moderation decision could not be confirmed.");}
    finally{setBusy(false);}
  }

  return <section className="mt-14 border-t border-border pt-10" aria-labelledby="pn-request-inbox">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h2 id="pn-request-inbox" className="type-h3">Corrections, removals &amp; claims</h2>
      <button type="button" onClick={()=>{void reload();}} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Refresh requests</button>
    </div>
    <p className="max-w-3xl text-sm leading-relaxed text-muted">
      These are private requests. A status decision only records editorial review; identity claims do not grant
      verified badges, publication control or user-account access. Handle personal contact information confidentially.
    </p>
    {notice?<p className="my-6 rounded-md border border-border bg-surface p-4" role="status">{notice}</p>:null}
    {permission===null?<p className="mt-6">Checking review access…</p>: permission===false
      ?<p className="mt-6">You do not have access to this private moderation inbox.</p>
      :requests.length===0?<p className="mt-6 rounded-lg border border-border bg-surface p-6">No active profile requests are awaiting review.</p>
      :<ul className="mt-7 grid gap-5 lg:grid-cols-2">{requests.map((item)=><li key={item.id} className="min-w-0 rounded-lg border border-border bg-surface p-6">
        <div className="mb-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent"><span>{item.kind}</span><span>{item.state}</span><span>{item.subjectKind}</span></div>
        <h3 className="break-words text-xl font-semibold">{item.subjectSlug}</h3>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{item.description}</p>
        {item.sourceUrl?<a className="mt-3 block break-all text-sm text-accent underline" href={item.sourceUrl} rel="noopener noreferrer nofollow" target="_blank">Supporting source</a>:null}
        {item.contactEmail?<p className="mt-4 break-all text-sm text-muted">Private reply address: {item.contactEmail}</p>:null}
        <p className="mt-4 text-xs text-muted">Received {new Date(item.submittedAt).toLocaleDateString("en-IN")} · Retention deadline {new Date(item.expiresAt).toLocaleDateString("en-IN")}</p>
        {item.decisionNote?<p className="mt-3 text-sm text-muted">Last review: {item.decisionNote}</p>:null}
        {item.state!=="CLOSED" && item.state!=="DECLINED" ? <>
          <label className="mt-5 grid gap-2 text-sm font-semibold">Editorial review reason
            <textarea maxLength={400} rows={3} value={notes[item.id]||""} onChange={(event)=>setNotes((prev)=>({...prev,[item.id]:event.target.value}))} className="rounded-md border border-border bg-background p-3"/>
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={busy} type="button" onClick={()=>{void decide(item,"NEEDS_EVIDENCE");}} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Need evidence</button>
            <button disabled={busy} type="button" onClick={()=>{void decide(item,"CLOSED");}} className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-surface">Close review</button>
            <button disabled={busy} type="button" onClick={()=>{void decide(item,"DECLINED");}} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Decline</button>
          </div>
        </>:null}
      </li>)}</ul>}
  </section>;
}

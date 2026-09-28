import { z } from "zod";
import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { createSequence } from "@/modules/comms/core";
import { invalidR6Request,parseR6ListRequest,r6CommandError,r6Json,resolveR6TeamRequest,unavailableR6Request } from "@/modules/r6/http";
import { listAuthorizedSequences } from "@/modules/r6/queries";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";
const schema=z.object({name:z.string().trim().min(1).max(160)}).strict();
export async function GET(request:Request){const q=parseR6ListRequest(request);if(!q)return invalidR6Request();const r=await resolveR6TeamRequest(request);if(r.kind==="response")return r.response;try{return r6Json(await listAuthorizedSequences(r.context,q.limit));}catch{return unavailableR6Request();}}
export async function POST(request:Request){if(!requireSameOrigin(request))return authorizationProblem(403,"AUTHZ_DENIED");const input=await parseAuthenticationJson(request,schema);if(!input)return invalidR6Request();const r=await resolveR6TeamRequest(request);if(r.kind==="response")return r.response;const a=await authorizeTrustedHttpOperation({context:r.context,permissionKey:"sequence.manage",resource:buildProspectiveR6Resource(r.context,"sequence","STANDARD","DRAFT"),command:{action:"create",requestedFields:["name"]}});if(a.kind==="response")return a.response;const out=await createSequence(r.context,input);if(out.kind==="error")return r6CommandError(out.code);return r6Json({sequence:out.value},201);}
import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";
import {
  OVERFETCH_FACTOR,
  authorizedReadableFields,
  commonResource,
  projectR6ReadableFields,
} from "./queries-shared";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";

export async function getAuthorizedDeal(context: AuthorizedRequestContext, dealId: string, database: PrismaClient = getPrismaClient()) {
  const row=await database.commercialDeal.findFirst({where:{id:dealId,ownerOrganizationId:context.tenant.organizationId,archivedAt:null},select:{id:true,resourceId:true,ownerOrganizationId:true,departmentId:true,ownerMembershipId:true,visibility:true,sensitivity:true,companyId:true,primaryContactId:true,sourceLeadId:true,pipelineId:true,stageId:true,amountMinor:true,currency:true,probability:true,expectedCloseDate:true,rowVersion:true}});
  if(!row)return undefined; const fields=["id","resourceId","companyId","primaryContactId","sourceLeadId","pipelineId","stageId","amountMinor","currency","probability","expectedCloseDate","ownerMembershipId","departmentId","rowVersion"] as const;
  const resource=commonResource({resourceId:row.resourceId,resourceType:"deal",ownerOrganizationId:row.ownerOrganizationId,departmentId:row.departmentId,ownerMembershipId:row.ownerMembershipId,visibility:row.visibility,sensitivity:row.sensitivity,lifecycleState:"ACTIVE",version:row.rowVersion});
  const readable=authorizedReadableFields(context,"deal.view",resource,fields,"view"); if(!readable)return undefined;
  return projectR6ReadableFields({...row,amountMinor:row.amountMinor?.toString()??null,probability:row.probability?.toString()??null,expectedCloseDate:row.expectedCloseDate?.toISOString().slice(0,10)??null},readable);
}
export async function getAuthorizedClient(context: AuthorizedRequestContext, clientAccountId: string, database: PrismaClient = getPrismaClient()) {
 const row=await database.commercialClientAccount.findFirst({where:{id:clientAccountId,ownerOrganizationId:context.tenant.organizationId,archivedAt:null},select:{id:true,resourceId:true,ownerOrganizationId:true,departmentId:true,ownerMembershipId:true,visibility:true,sensitivity:true,clientOrganizationId:true,accountManagerMembershipId:true,health:true,onboardingState:true,portalState:true,customerSince:true,rowVersion:true}});
 if(!row)return undefined; const fields=["id","resourceId","clientOrganizationId","accountManagerMembershipId","health","onboardingState","portalState","customerSince","rowVersion"] as const; const resource=commonResource({resourceId:row.resourceId,resourceType:"client-account",ownerOrganizationId:row.ownerOrganizationId,departmentId:row.departmentId,ownerMembershipId:row.ownerMembershipId,visibility:row.visibility,sensitivity:row.sensitivity,lifecycleState:"ACTIVE",version:row.rowVersion}); const readable=authorizedReadableFields(context,"client.view",resource,fields,"view");if(!readable)return undefined;return projectR6ReadableFields({...row,customerSince:row.customerSince?.toISOString().slice(0,10)??null},readable);
}
export async function listAuthorizedDealPipelines(context: AuthorizedRequestContext, limit:number, database:PrismaClient=getPrismaClient()){
 const rows=await database.commercialDealPipeline.findMany({where:{ownerOrganizationId:context.tenant.organizationId,archivedAt:null,active:true},orderBy:[{updatedAt:"desc"},{id:"desc"}],take:Math.min(limit*OVERFETCH_FACTOR,400)});
 const stages=rows.length
   ? await database.commercialDealStage.findMany({
       where:{
         ownerOrganizationId:context.tenant.organizationId,
         pipelineId:{in:rows.map((row)=>row.id)},
       },
       orderBy:[{position:"asc"},{id:"asc"}],
       select:{id:true,pipelineId:true,pipelineVersion:true,key:true,name:true,position:true,canonicalClass:true,probability:true},
     })
   : [];
 const items=[];for(const row of rows){const fields=["id","resourceId","name","version","active","rowVersion"] as const;const resource=commonResource({resourceId:row.resourceId,resourceType:"deal-pipeline",ownerOrganizationId:row.ownerOrganizationId,departmentId:row.departmentId,ownerMembershipId:row.ownerMembershipId,visibility:row.visibility,sensitivity:row.sensitivity,lifecycleState:"ACTIVE",version:row.rowVersion});const readable=authorizedReadableFields(context,"deal.manage",resource,fields,"view");if(!readable)continue;const pipelineStages=stages.filter((stage)=>stage.pipelineId===row.id&&stage.pipelineVersion===row.version);items.push({...projectR6ReadableFields(row,readable),stages:pipelineStages.map((s)=>({...s,probability:s.probability?.toString()??null}))});if(items.length>=limit)break}return {items};
}
export async function listAuthorizedClientRelationships(context:AuthorizedRequestContext,clientAccountId:string,limit:number,database:PrismaClient=getPrismaClient()){
 const account=await database.commercialClientAccount.findFirst({where:{id:clientAccountId,ownerOrganizationId:context.tenant.organizationId,archivedAt:null},select:{resourceId:true,ownerOrganizationId:true,departmentId:true,ownerMembershipId:true,visibility:true,sensitivity:true,rowVersion:true}});if(!account)return undefined;
 const resource=commonResource({resourceId:account.resourceId,resourceType:"client-account",ownerOrganizationId:account.ownerOrganizationId,departmentId:account.departmentId,ownerMembershipId:account.ownerMembershipId,visibility:account.visibility,sensitivity:account.sensitivity,lifecycleState:"ACTIVE",version:account.rowVersion});
 const rows=await database.commercialClientRelationship.findMany({where:{clientAccountId,ownerOrganizationId:context.tenant.organizationId,archivedAt:null},take:Math.min(limit,100),orderBy:{id:"asc"}});const fields=["id","clientAccountId","personId","contactId","relationshipRole","isPrimary","isBilling","isApprover","isAdmin"] as const;const readable=authorizedReadableFields(context,"client.contact.manage",resource,fields,"view");return readable?{items:rows.map(r=>projectR6ReadableFields(r,readable))}:undefined;
}

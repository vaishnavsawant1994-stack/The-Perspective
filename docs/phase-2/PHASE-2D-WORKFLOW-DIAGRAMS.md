# Phase 2D — Workflow Diagrams

**Status:** Frozen  
**Notation:** solid arrows are normal transitions; dotted arrows are configured skips/optional branches; red-labelled nodes are controlled exceptions.

## 1. Platform master lifecycle

```mermaid
flowchart LR
  A[Lead Discovery] --> B[Extraction]
  B --> C[Enrichment]
  C --> D[Qualification]
  D --> E[Outreach]
  E --> F[Reply]
  F --> G[Opportunity / Meeting]
  G --> H[Proposal / Negotiation]
  H --> I[Contract]
  I --> J[Invoice / Payment]
  J --> K[Client / Onboarding]
  K --> L[Project / Production]
  L --> M[Internal Review]
  M --> N[Client Review]
  N --> O[Approval]
  O --> P[Publishing]
  P --> Q[Distribution]
  Q --> R[Reporting]
  R --> S[Delivery]
  S --> T[Renewal]
  T -->|new opportunity| G
```

Each box is a domain boundary, not one shared status enum.

## 2. Sales: lead, outreach and deal

```mermaid
flowchart TD
  N[NEW] --> X[EXTRACTED] --> EP[ENRICHMENT_PENDING] --> E[ENRICHED]
  E --> QP[QUALIFICATION_PENDING] --> Q[QUALIFIED] --> OR[OUTREACH_READY]
  OR --> C[CONTACTED] --> R[REPLIED] --> I[INTERESTED] --> V[CONVERTED]
  QP --> NQ[NOT_QUALIFIED]
  E --> IC[INVALID_CONTACT]
  OR --> DNC[DO_NOT_CONTACT]
  C --> NR[NO_RESPONSE]
  C --> FL[FOLLOW_UP_LATER]
  X --> DU[DUPLICATE]

  subgraph Outreach Campaign
    CD[DRAFT] --> CR[READY] --> CA[APPROVED] --> CS[SCHEDULED] --> RUN[RUNNING]
    RUN --> CP[PAUSED]
    CP --> RUN
    RUN --> CC[COMPLETED]
  end

  subgraph Deal
    DQ[QUALIFIED] --> DI[INTERESTED] --> DS[DISCOVERY_SCHEDULED] --> DC[DISCOVERY_COMPLETED]
    DC --> PP[PROPOSAL_PREPARATION] --> PS[PROPOSAL_SENT] --> NG[NEGOTIATION]
    NG --> VC[VERBAL_CONFIRMATION] --> CTS[CONTRACT_SENT] --> CSG[CONTRACT_SIGNED]
    CSG --> PAY[PAYMENT_PENDING] --> WON[WON]
    NG --> LOST[LOST]
    DC --> HOLD[ON_HOLD]
  end

  I --> DQ
```

A positive reply emits `lead.positive_reply`, stops remaining recipient steps, and creates an owner follow-up.

## 3. Commercial and finance

```mermaid
flowchart LR
  subgraph Proposal
    PD[DRAFT] --> PIR[INTERNAL_REVIEW] --> PA[APPROVED] --> PS[SENT] --> PV[VIEWED]
    PV --> PCR[CLIENT_REVIEW] --> PAC[ACCEPTED]
    PCR --> PCH[CHANGES_REQUESTED]
    PCH -->|new version| PIR
  end
  PAC --> CD[DRAFT]
  subgraph Contract
    CD --> CIR[INTERNAL_REVIEW] --> CA[APPROVED] --> CS[SENT] --> CV[VIEWED]
    CV --> CSP[SIGNATURE_PENDING] --> CSG[SIGNED] --> ACT[ACTIVE]
  end
  CSG --> ID[DRAFT]
  subgraph Invoice
    ID --> IA[APPROVED] --> IS[SENT] --> IO[OPEN] --> IPP[PARTIALLY_PAID] --> IPAID[PAID]
    IO --> IOD[OVERDUE]
  end
  IS --> PP[PENDING]
  subgraph Payment
    PP --> PROC[PROCESSING] --> SUC[SUCCEEDED]
    PROC --> FAIL[FAILED]
    SUC --> PREF[PARTIALLY_REFUNDED] --> REF[REFUNDED]
    SUC --> DISP[DISPUTED]
  end
```

Invoice/payment projections derive from verified allocations and processor evidence; the UI cannot manually assert success.

## 4. Generic project and approval loop

```mermaid
flowchart TD
  D[DRAFT] --> P[PLANNED] --> A[ACTIVE] --> R[REVIEW] --> AP[APPROVAL]
  AP --> PR[PUBLICATION_READY] --> PUB[PUBLISHED] --> DIST[DISTRIBUTING]
  DIST --> DEL[DELIVERY] --> C[COMPLETED] --> AR[ARCHIVED]
  A --> BL[BLOCKED]
  BL --> A
  A --> OH[ON_HOLD]
  OH --> A
  AP --> CR[CHANGES_REQUESTED]
  CR -->|successor version| R

  subgraph Central Approval
    AD[DRAFT] --> AQ[REQUESTED] --> AIR[IN_REVIEW] --> AA[APPROVED]
    AIR --> ACR[CHANGES_REQUESTED]
    AIR --> AREJ[REJECTED]
    AQ --> ASUP[SUPERSEDED]
  end
```

The approval target is an immutable version/hash. A changed resource supersedes the old request.

## 5. Editorial article/blog

```mermaid
flowchart LR
  PC[PROJECT_CREATED] --> BR[BRIEF_READY] --> Q[QUESTIONNAIRE_PENDING] --> RES[RESEARCH]
  RES --> WA[WRITER_ASSIGNED] --> DR[DRAFTING] --> IR[INTERNAL_REVIEW]
  IR --> IV[INTERNAL_REVISION] --> IR
  IR -. contracted client review .-> CR[CLIENT_REVIEW]
  CR --> CV[CLIENT_REVISION] --> CR
  CR --> CAP[CLIENT_APPROVED]
  IR -. internal publication .-> SEO[SEO_REVIEW]
  CAP --> SEO --> PR[PUBLICATION_READY] --> SCH[SCHEDULED] --> PUB[PUBLISHED]
  PUB --> DIS[DISTRIBUTED] --> COM[COMPLETED]
```

Client review is a template policy branch; skipping it is an auditable transition, not a hidden UI shortcut.

## 6. Magazine and Personal Magazine

```mermaid
flowchart TD
  PC[PROJECT_CREATED] --> CSR[COVER_SLOT_RESERVED] --> EB[EDITORIAL_BRIEF]
  EB --> QC[QUESTIONNAIRE_CREATED] --> QS[QUESTIONNAIRE_SENT] --> QR[QUESTIONNAIRE_RECEIVED]
  QR --> IS[INTERVIEW_SCHEDULED] --> IC[INTERVIEW_COMPLETED]
  IC --> AR[ASSETS_REQUESTED] --> AREC[ASSETS_RECEIVED]
  AREC --> AD[ARTICLE_DRAFTING] --> ER[EDITORIAL_REVIEW] --> CAR[CLIENT_ARTICLE_REVIEW]
  CAR --> AA[ARTICLE_APPROVED] --> CC[COVER_CONCEPT] --> CIR[COVER_INTERNAL_REVIEW]
  CIR --> CCR[COVER_CLIENT_REVIEW] --> CA[COVER_APPROVED] --> PD[PAGE_DESIGN]
  PD --> IDR[INTERNAL_DESIGN_REVIEW] --> CDR[CLIENT_DESIGN_REVIEW]
  CDR --> DR[DESIGN_REVISION] --> IDR
  CDR --> FP[FINAL_PROOF] --> FCA[FINAL_CLIENT_APPROVAL] --> RB[DIGITAL_READER_BUILD]
  RB --> PR[PUBLICATION_READY] --> PUB[PUBLISHED] --> DIST[DISTRIBUTION]
  DIST --> DEL[CLIENT_DELIVERY] --> COM[COMPLETED]
```

Package templates may skip declared stages only when the skip policy, authority and reason are stored.

## 7. Podcast

```mermaid
flowchart LR
  P[PROSPECT] --> I[INVITED] --> IN[INTERESTED] --> C[CONFIRMED] --> O[ONBOARDING]
  O --> BA[BIO_ASSETS_PENDING] --> TP[TOPIC_PENDING] --> TR[TALKING_POINTS_REVIEW]
  TR --> S[SCHEDULING] --> RS[RECORDING_SCHEDULED] --> R[RECORDED] --> E[EDITING]
  E --> IR[INTERNAL_REVIEW] --> GR[GUEST_REVIEW] --> A[APPROVED]
  A --> PR[PUBLICATION_READY] --> PUB[PUBLISHED] --> CL[CLIPS_CREATED]
  CL --> D[DISTRIBUTED] --> CO[COMPLETED]
  RS --> RR[RESCHEDULE_REQUIRED]
  RS --> NS[NO_SHOW]
  I --> DEC[DECLINED]
```

## 8. Video

```mermaid
flowchart LR
  I[IDEA] --> B[BRIEF] --> GC[GUEST_CONFIRMED] --> S[SCRIPTING]
  S --> PP[PRE_PRODUCTION] --> SS[SHOOT_SCHEDULED] --> SH[SHOT] --> E[EDITING]
  E --> IR[INTERNAL_REVIEW] --> CR[CLIENT_REVIEW] --> A[APPROVED]
  A --> T[THUMBNAIL_READY] --> M[METADATA_READY] --> PR[PUBLICATION_READY]
  PR --> PUB[PUBLISHED] --> CL[CLIPS_CREATED] --> D[DISTRIBUTED] --> C[COMPLETED]
  CR -->|successor edit| E
```

## 9. Event and speakers

```mermaid
flowchart TD
  P[PLANNING] --> SO[SPEAKER_OUTREACH] --> SC[SPEAKERS_CONFIRMED]
  SC --> PO[PARTNER_OUTREACH] --> AB[AGENDA_BUILDING] --> RO[REGISTRATION_OPEN]
  RO --> PE[PRE_EVENT] --> L[LIVE] --> C[COMPLETED]
  C --> PC[POST_EVENT_CONTENT] --> D[DISTRIBUTION] --> R[REPORTING] --> CL[CLOSED]
  PE --> POS[POSTPONED]
  P --> CAN[CANCELLED]

  subgraph Speaker
    SI[IDENTIFIED] --> SIV[INVITED] --> SIN[INTERESTED] --> SCO[CONFIRMED]
    SCO --> SAP[ASSETS_PENDING] --> SSC[SESSION_CONFIRMED] --> SLC[LOGISTICS_COMPLETE]
    SLC --> SAT[ATTENDED] --> SCOMP[COMPLETED]
  end
```

## 10. Publishing and distribution

```mermaid
flowchart TD
  D[DRAFT] --> ER[EDITORIAL_READY] --> TR[TECHNICAL_READY] --> A[APPROVED]
  A --> RP[READY_TO_PUBLISH] --> S[SCHEDULED] --> P[PUBLISHING] --> PUB[PUBLISHED]
  TR --> B[BLOCKED]
  P --> F[FAILED]
  F -->|new job attempt| P
  PUB --> CP[CORRECTION_PENDING]
  CP --> ER
  PUB --> U[UNPUBLISHED]
  PUB --> AR[ARCHIVED]

  PUB --> DC[DISTRIBUTION DRAFT] --> DA[ASSETS_READY] --> DAP[APPROVED]
  DAP --> DS[SCHEDULED] --> DR[RUNNING] --> DCOM[COMPLETED]
  DR --> ITEM[PENDING → SCHEDULED → PUBLISHING → PUBLISHED]
```

Publication retry creates a new job attempt with the same release-version/destination idempotency key.

## 11. Reporting, delivery and renewal

```mermaid
flowchart LR
  CD[COLLECTING_DATA] --> D[DRAFT] --> IR[INTERNAL_REVIEW] --> A[APPROVED]
  A --> CR[CLIENT_READY] --> DL[DELIVERED]
  CD --> DI[DATA_INCOMPLETE]

  DL --> PREP[DELIVERY PREPARING] --> READY[READY] --> SENT[SENT]
  SENT --> VIEW[VIEWED] --> ACK[ACKNOWLEDGED] --> COMP[COMPLETED]

  COMP --> ND[NOT_DUE] --> UP[UPCOMING] --> RR[REVIEW_REQUIRED]
  RR --> OC[OPPORTUNITY_CREATED] --> O[OUTREACH] --> INT[INTERESTED]
  INT --> PROP[PROPOSAL] --> NEG[NEGOTIATION] --> REN[RENEWED]
  REN -->|successor Deal / Project| OC
```

`RENEWED` links a successor deal/project and never mutates the completed predecessor.

## 12. Client-safe approval example

```mermaid
sequenceDiagram
  participant C as Client
  participant API as Command API
  participant P as Policy Engine
  participant A as Approval Aggregate
  participant O as Outbox/Automation

  C->>API: approve exact designVersionId
  API->>P: verify CLIENT scope, membership, visibility, active request
  P-->>API: allowed
  API->>A: IN_REVIEW → APPROVED (expectedVersion)
  A-->>API: immutable ApprovalDecision
  API->>O: approval.approved
  O-->>O: notify AM + Designer; recalculate readiness
  API-->>C: approved version + updated client-safe state
```

If a newer version exists, the command returns a stale/superseded conflict and creates no decision.


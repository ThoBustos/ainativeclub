import { Inngest, EventSchemas } from "inngest";

type Events = {
  "whatsapp/message.received": {
    data: {
      from: string;       // whatsapp:+1234567890
      body: string;
      messageSid: string;
      numMedia: number;
    };
  };
  "call/transcript.uploaded": {
    data: {
      callId: string;
      memberId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "ainativeclub",
  schemas: new EventSchemas().fromRecord<Events>(),
});

import { JustconnectReportGenerator } from "@/components/JustconnectReportGenerator";
import { AppLayout } from "@/components/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <JustconnectReportGenerator />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;

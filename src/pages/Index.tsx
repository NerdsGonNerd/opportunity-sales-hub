
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CRM Dashboard</CardTitle>
          <p className="text-gray-600">Sales opportunity management system</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/opportunities')} 
            className="w-full"
            size="lg"
          >
            View Sales Opportunities
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;

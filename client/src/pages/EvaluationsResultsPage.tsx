import { SidebarSection } from "./sections/SidebarSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const EvaluationsResultsPage = (): JSX.Element => {
  const evaluationData = [
    { name: "Accuracy", value: 92 },
    { name: "Speed", value: 87 },
    { name: "Reliability", value: 95 },
    { name: "Efficiency", value: 88 },
  ];

  const recentEvaluations = [
    { id: 1, agent: "Data Analyzer", date: "2024-03-08", score: 92, status: "passed" },
    { id: 2, agent: "Report Generator", date: "2024-03-07", score: 87, status: "passed" },
    { id: 3, agent: "Quality Checker", date: "2024-03-06", score: 78, status: "warning" },
    { id: 4, agent: "Performance Monitor", date: "2024-03-05", score: 95, status: "passed" },
  ];

  return (
    <div className="bg-white overflow-x-hidden w-full flex">
      <div className="flex w-full relative flex-col items-start bg-white">
        <div className="flex items-start relative self-stretch w-full bg-neutral-50">
          <SidebarSection />
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Evaluations Results</h1>
              <p className="text-gray-600 mt-2">View agent performance metrics and evaluation scores</p>
            </div>

            <div className="grid gap-6 mb-8">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={evaluationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Evaluations</h2>
                <div className="space-y-4">
                  {recentEvaluations.map((eval_) => (
                    <div
                      key={eval_.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{eval_.agent}</p>
                        <p className="text-sm text-gray-600">{eval_.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{eval_.score}%</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            eval_.status === "passed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {eval_.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

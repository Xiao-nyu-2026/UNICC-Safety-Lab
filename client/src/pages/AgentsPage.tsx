import { SidebarSection } from "./sections/SidebarSection";

export const AgentsPage = (): JSX.Element => {
  const agents = [
    { id: 1, name: "Data Analyzer", status: "active", tasks: 156 },
    { id: 2, name: "Report Generator", status: "active", tasks: 89 },
    { id: 3, name: "Quality Checker", status: "inactive", tasks: 34 },
    { id: 4, name: "Performance Monitor", status: "active", tasks: 203 },
  ];

  return (
    <div className="bg-white overflow-x-hidden w-full flex">
      <div className="flex w-full relative flex-col items-start bg-white">
        <div className="flex items-start relative self-stretch w-full bg-neutral-50">
          <SidebarSection />
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
              <p className="text-gray-600 mt-2">Manage and monitor your AI agents</p>
            </div>

            <div className="grid gap-4">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        agent.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Tasks completed: {agent.tasks}
                    </span>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { SidebarSection } from "./sections/SidebarSection";

export const SettingsPage = (): JSX.Element => {
  return (
    <div className="bg-white overflow-x-hidden w-full flex">
      <div className="flex w-full relative flex-col items-start bg-white">
        <div className="flex items-start relative self-stretch w-full bg-neutral-50">
          <SidebarSection />
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account and preferences</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
              {/* Account Settings */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      defaultValue="user@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your Name"
                      defaultValue="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about agents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="font-medium text-gray-900">Evaluation Alerts</p>
                      <p className="text-sm text-gray-600">Get notified of evaluation results</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="font-medium text-gray-900">Performance Reports</p>
                      <p className="text-sm text-gray-600">Weekly performance summaries</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* API Settings */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">API Settings</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-900">API Key</label>
                    <div className="flex gap-2">
                      <input
                        id="api-key"
                        type="password"
                        placeholder="••••••••••••••••"
                        defaultValue="sk_test_abc123def456"
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Regenerate
                      </button>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    View API Documentation
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Irreversible and destructive actions
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

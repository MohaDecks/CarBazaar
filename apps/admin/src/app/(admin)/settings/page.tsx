export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <div className="mt-6 max-w-lg space-y-4 bg-white p-6 text-sm shadow-sm">
        <p>
          <span className="text-gray-500">Currency</span>
          <br />
          ETB (Ethiopian Birr)
        </p>
        <p>
          <span className="text-gray-500">Primary market</span>
          <br />
          Ethiopia
        </p>
        <p>
          <span className="text-gray-500">Storage</span>
          <br />
          Cloudinary (active). Local for development. S3 is a future provider and is not required.
        </p>
      </div>
    </div>
  );
}

import ArtworksTable from "./components/ArtworksTable";

export default function App() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <nav className="bg-orange-100 p-4 flex justify-center shadow-md">
        <img className="p-3 w-80 hover:scale-105 transition-transform duration-300" src="https://www.growmeorganic.com/wp-content/uploads/2020/05/GrowMeOrganicLogo-e1589337030567.png" alt="GrowMeOrganic Logo" />
      </nav>
      <div className="w-full bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto bg-gray p-8 shadow-lg rounded-lg">
          <ArtworksTable />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center  min-h-screen p-6">
      <h1 className="title">MedTrack</h1>
      <p className="text-lg0 text-center max-w-2xl mb-6">
        MedTrack is a web application that simplifies scheduling and tracking
        medical appointments, provides insight into therapy, and allows users
        easy access to all medical information. The app helps patients and
        doctors efficiently manage health data and plan the next steps in
        treatment.
      </p>
      <img
        src="/src/assets/logo.webp"
        alt="MedTrack Logo"
        className="w-40 h-40 object-contain rounded-lg shadow-md"
      />
    </div>
  );
}

type Props = {
  address: string;
};

export function LocationButton({ address }: Props) {
  // const address = encodeURIComponent(
  //   "Elias Moyano y Fray Davila, Reduccion, Cordoba, Argentina"
  // );
  // const encodedAddress = encodeURIComponent(address);
  // const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  // const url = `https://www.google.com/maps/place/${encodedAddress}`;
  // const url = encodedAddress;

  return (
    <a
      href={address}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="floating-btn flex items-center gap-3 px-5 py-3 rounded-full shadow-lg backdrop-blur hover:scale-105 transition">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11a3 3 0 100-6 3 3 0 000 6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 11c0 7-7.5 11-7.5 11S4.5 18 4.5 11a7.5 7.5 0 1115 0z"
          />
        </svg>

        <span className="text-sm font-medium">Cómo llegar</span>
      </div>
    </a>
  );
}

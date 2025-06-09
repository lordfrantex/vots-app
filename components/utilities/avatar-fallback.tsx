export const getRandomGradient = () => {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-yellow-500 to-orange-600",
    "from-indigo-500 to-blue-600",
    "from-purple-500 to-pink-600",
    "from-teal-500 to-green-600",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

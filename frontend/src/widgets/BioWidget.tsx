import { Github, Linkedin, Globe, Mail } from "lucide-react";

export default function BioWidget() {
  const links = [
    { name: "GitHub", url: "https://github.com/DeysRodrigues", icon: <Github size={18}/>, color: "bg-gray-800" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: <Linkedin size={18}/>, color: "bg-blue-700" },
    { name: "Portfolio", url: "#", icon: <Globe size={18}/>, color: "bg-emerald-600" },
    { name: "Contato", url: "mailto:email@exemplo.com", icon: <Mail size={18}/>, color: "bg-rose-500" },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img 
            src="https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg" 
            alt="Avatar" 
            className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-md object-cover mb-3"
          />
          <h2 className="font-bold text-gray-800 text-lg">Deys Rodrigues</h2>
          <p className="text-sm text-gray-500">Full Stack Developer</p>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-3 px-4 py-3 text-white rounded-xl shadow-sm hover:scale-[1.02] transition-transform ${link.color}`}
            >
              {link.icon}
              <span className="font-medium text-sm">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
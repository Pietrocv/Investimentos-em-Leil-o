import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-brand-green/15 bg-white/90 px-4 py-3 backdrop-blur-xl lg:ml-72">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-brand-green lg:hidden">Investindo com Leilao</Link>
        <span className="hidden font-semibold text-brand-green lg:block">Investindo com Leilao</span>
        <span className="rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1 text-sm text-brand-text/80">{user?.name}</span>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto text-sm lg:hidden">
        <Link className="rounded-md border border-brand-green/15 px-3 py-1 text-brand-text/75" to="/dashboard">Dashboard</Link>
        <Link className="rounded-md border border-brand-green/15 px-3 py-1 text-brand-text/75" to="/properties">Imoveis</Link>
        <Link className="rounded-md border border-brand-green/15 px-3 py-1 text-brand-text/75" to="/investors">Investidores</Link>
        <Link className="rounded-md border border-brand-green/15 px-3 py-1 text-brand-text/75" to="/settings">Configuracoes</Link>
      </nav>
    </header>
  );
}

import { Outlet } from "react-router-dom"; import { Header } from "./Header"; import { Sidebar } from "./Sidebar";
export function Layout() { return <><Sidebar/><Header/><main className="min-h-screen p-4 lg:ml-72 lg:p-8"><Outlet/></main></>; }

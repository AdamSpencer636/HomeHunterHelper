import { Outlet } from "@remix-run/react";
import Navbar from "../components/NavBar";


export default function Organizer() {
    return (
		<div className="max-w-full overflow-x-hidden">
			<Navbar />
			<Outlet />
		</div>
	);
}
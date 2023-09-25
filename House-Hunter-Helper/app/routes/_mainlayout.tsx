
import { Outlet } from '@remix-run/react';
import Navbar from '../components/NavBar';

export default function MainLayout() {
    return (
		<div className='max-w-full overflow-x-hidden'>
			<Navbar />
			<Outlet />
		</div>
	);
}

//Main Layout File
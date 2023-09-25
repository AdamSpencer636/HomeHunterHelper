import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { UserButton } from "@clerk/remix";
import {
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenuToggle,
	NavbarMenu,
	NavbarMenuItem,
	Link,
} from "@nextui-org/react";

import { useState } from "react";

export default function NavBar() {

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<Navbar
			isMenuOpen={isMenuOpen}
			onMenuOpenChange={setIsMenuOpen}
			maxWidth="full"
		>
			<NavbarContent className="lg:hidden" justify="start">
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
				/>
			</NavbarContent>

			<NavbarContent className="lg:hidden pr-3" justify="center">
				<NavbarBrand>
					<Link href="/home" color="success">
						<p className="font-bold text-2xl">
							House Hunter Helper
						</p>
					</Link>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden lg:flex gap-4" justify="start">
				<NavbarBrand>
					<Link href="/home" color="success">
						<p className="font-bold text-2xl">
							House Hunter Helper
						</p>
					</Link>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden lg:flex" justify="end">
				<NavbarItem>
					<ThemeSwitcher />
				</NavbarItem>
				<NavbarItem>
					<UserButton afterSignOutUrl="/" />
				</NavbarItem>
			</NavbarContent>

			<NavbarMenu>
				<NavbarMenuItem className="flex space-x-2">
					<UserButton afterSignOutUrl="/" />
					<ThemeSwitcher />
				</NavbarMenuItem>
			</NavbarMenu>
		</Navbar>
	);
}

/* 
<div className="w-full flex justify-end p-3">
			<ThemeSwitcher />
			<UserButton afterSignOutUrl="/" />
		</div>
*/
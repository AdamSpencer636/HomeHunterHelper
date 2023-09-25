import useDarkMode from "use-dark-mode"; 

import {Switch} from "@nextui-org/react";

import { Sun } from "lucide-react";
import { Moon } from "lucide-react";

import { useState } from "react";

export const ThemeSwitcher = () => {
	const darkMode = useDarkMode(false);
	const [Selected, setSelected] = useState(true); 
    const toggle = () => {
		if (Selected) {
			darkMode.disable();
		}
		else {
			darkMode.enable();
		}
    }

    return (
		<div className="w-max">
			<Switch
				size="lg"
				color="success"
				startContent={<Moon />}
				endContent={<Sun />}
				isSelected={Selected}
				onValueChange={setSelected}
				onChange={() => {
					toggle();
				}}
			/>
		</div>
	);
}
import type { LinksFunction } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import { NextUIProvider } from "@nextui-org/react";
import styles from "./globals.css";

import { ClerkApp, V2_ClerkErrorBoundary } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server.js";

import NavBar from "./components/NavBar";
import useDarkMode from "use-dark-mode";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

//Load Auth Loader
export const loader: LoaderFunction = async (args) => {
	return rootAuthLoader(args, ({ request }) => {
		return json({
			ENV: {
				SUPABASE_URL: process.env.SUPABASE_URL,
				SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,  //Use Env Variables in browser without exposing them
			},
		});
	});
};

// add an Error Boundary
export const ErrorBoundary = V2_ClerkErrorBoundary();

function App() {
	const data = useLoaderData<typeof loader>();
	const darkMode = useDarkMode(false);
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body
				className={`${
					darkMode.value ? "dark" : ""
				} text-foreground bg-background`}
			>
				<NextUIProvider>
					<Outlet />
					<ScrollRestoration />
					<script
						dangerouslySetInnerHTML={{
							__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
						}}
					/>
					<Scripts />
					<LiveReload />
				</NextUIProvider>
			</body>
		</html>
	);
}

// Wrap your app in ClerkApp(app)
export default ClerkApp(App);

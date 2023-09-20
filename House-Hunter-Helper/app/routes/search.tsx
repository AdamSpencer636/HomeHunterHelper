import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export const meta: MetaFunction = () => {
	return [
		{ title: "House Hunter Helper" },
		{
			name: "Helping you find homes and stay organized during your hunt.",
			content: "Start House Hunting Here!",
		},
	];
};

export default function SearchResults() {
    const searchResults = useActionData<typeof action>();
    return (
        <div>
            <h1>Search Results</h1>
            <pre>{ searchResults }</pre> {/* this is just to show the search works will remove later */}
        </div>
    );

}

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
    let search = formData.get("search");
    //Fetch data from API Here
	return search;
};
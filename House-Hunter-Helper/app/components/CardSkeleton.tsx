import { Skeleton, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";


export default function RecentCardSkeleton() {
    return (
        <>
            {Array(5).fill(0).map((_, i) => (
                <Card
                    key={i}
                    shadow="lg"
                    className="m-5 w-[15vw]"
                    isPressable
                >
                    <CardHeader>
                        <Skeleton className="rounded-lg" />
                    </CardHeader>
                    <CardBody>
                        <p>
                            <Skeleton className="rounded-lg" />
                        </p>
                        <p>
                            <Skeleton className="rounded-lg" />
                        </p>
                    </CardBody>
                    <CardFooter>
                        <Skeleton className="rounded-lg" />
                    </CardFooter>
                </Card>
            ))}
        </>
    )
}

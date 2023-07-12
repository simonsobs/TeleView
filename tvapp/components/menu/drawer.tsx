import React from "react";


type ClickBarrierProps = {
    onClick: () => void;
}


export function ClickBarrier({ onClick }: ClickBarrierProps): React.ReactElement {
    return (
        <div
            className="absolute top-0 left-0 h-screen w-screen bg-grey-100 backdrop-blur-sm z-30"
            onClick={onClick}
        >
        </div>
    );
}


type DrawerProps = {
    closeCallback: () => void;
    title: string;
    children: React.ReactNode;
}


export default function Drawer({ closeCallback, title, children }: DrawerProps) {
    return (
        <div className="flex-col h-full bg-tvblue">
            <div className="flex flex-row justify-end bg-tvyellow text-tvpurple text-3xl">
                <div className="grow text-center mx-3">
                    { title }
                </div>
                <button
                    className={"bg-tvbrown text-tvgrey hover:text-tvorange hover:border-tvorange border-2 end-0"}
                    onClick={ closeCallback }
                >
                    X
                </button>
            </div>
            <div className="flex flex-row bg-tvpurple p-6">
                { children }
            </div>
        </div>
    );
}

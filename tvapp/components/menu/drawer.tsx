import React, {Dispatch, SetStateAction, useEffect, useRef, createRef} from "react";


function assertIsNode(e: EventTarget | null): asserts e is Node {
    if (!e || !("nodeType" in e)) {
        throw new Error(`Node expected`);
    }
}


type DrawerProps = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    title: string;
    children: React.ReactNode;
}


export default function Drawer({ isOpen, setIsOpen, title, children }: DrawerProps) {
    const drawerRef = createRef<HTMLDivElement>();
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            drawerRef.current.focus();
        }
    }, [isOpen, drawerRef]);
    useEffect(() => {
        const handleClickOutside = (event: Event): void => {
            const target = event.target
            assertIsNode(target);
            if (drawerRef.current && target!== null && !drawerRef.current.contains(target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [drawerRef, setIsOpen]);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);
    if (isOpen) {
        return (
            <div>
                <div className="flex flex-column h-screen w-screen bg-grey-100 backdrop-blur-sm z-30">
                    <div
                        ref={drawerRef}
                        tabIndex={-1}
                        className="justify-content-center bg-tvblue h-full w-auto z-40">
                        <div className="flex flex-row justify-end bg-tvyellow text-tvpurple text-xl ">
                            <div className="grow text-center mx-3">
                                {title}
                            </div>
                            <button className={"bg-tvbrown text-tvgrey hover:text-tvorange hover:border-tvorange h-8 border-2 end-0"} onClick={() => setIsOpen(false)}>
                                X
                            </button>
                        </div>
                        <div className="flex flex-row bg-tvpurple">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return <></>
}

import React from "react";

export default function TestButton() {
    const handleClick = () => {
        alert("Test button clicked!");
        console.log("Test button clicked!");
    };

    return (
        <button
            onClick={handleClick}
            style={{
                padding: "10px 20px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
            }}
        >
            TEST CLICK ME
        </button>
    );
}

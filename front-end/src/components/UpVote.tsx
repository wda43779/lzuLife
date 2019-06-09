import React from "react";
import Button from "react-bootstrap/Button";

interface IUpVote {
  upVote?: boolean;
  upVoteCount: number;
  onClick: (nextState: boolean) => void;
}

const UpVote: React.FC<IUpVote> = ({
  upVote,
  upVoteCount,
  onClick
}) => {
  return (
    <Button
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        onClick(!upVote);
      }}
      style={{
        color: upVote ? "white" : "#0084ff",
        background: upVote ? "#0084ff" : "#e9f3ff"
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "0",
          height: "0",
          borderWidth: "0 8px 16px",
          borderStyle: "solid",
          borderColor: "rgba(0,0,0,0)",
          borderBottomColor: upVote ? "white" : "#0084ff",
          margin: "0 4px"
        }}
      />
      {upVote ? "已赞同" : "赞同"} {upVoteCount}
    </Button>
  );
};

export default UpVote;

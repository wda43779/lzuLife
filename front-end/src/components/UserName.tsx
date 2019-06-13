import Axios from "axios";
import React, { useEffect, useState } from "react";

// Get username from a userid
const UserName: React.FC<{
  id?: string;
  children?: string;
  style?: React.CSSProperties;
}> = props => {
  const [username, $username] = useState("");

  useEffect(() => {
    (async () => {
      if (props.id || props.children) {
        const res = await Axios.get(
          `/api/v1/users/${props.id || props.children}`
        );
        $username(res.data.user.username);
      }
    })();
  }, [props.id, props.children]);

  return <span style={props.style}>{username}</span>;
};

export default UserName;

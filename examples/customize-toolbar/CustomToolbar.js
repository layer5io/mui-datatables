import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { withStyles } from "tss-react/mui";
const defaultToolbarStyles = {
  iconButton: {
  },
};

class CustomToolbar extends React.Component {
  
  handleClick = () => {
    console.log("clicked on icon!");
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Tooltip title={"custom icon"}>
          <IconButton className={classes.iconButton} onClick={this.handleClick}>
            <AddIcon className={classes.deleteIcon} />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }

}

export default withStyles(CustomToolbar, defaultToolbarStyles, { name: "CustomToolbar" });

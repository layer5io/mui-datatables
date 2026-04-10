import React from "react";
import { TableFooter, TableRow, TableCell, TablePagination as MuiTablePagination } from "@mui/material";
import { withStyles } from "tss-react/mui";

const defaultFooterStyles = {
};

class CustomFooter extends React.Component {

  handleRowChange = event => {
    this.props.changeRowsPerPage(event.target.value);
  };

  handlePageChange = (_, page) => {
    this.props.changePage(page);
  };

  render() {
    const { count, classes, textLabels, rowsPerPage, page } = this.props;

    const footerStyle = {
      display:'flex', 
      justifyContent: 'flex-end',
      padding: '0px 24px 0px 24px'
    };

    return (
      <TableFooter>
        <TableRow>
          <TableCell style={footerStyle} colSpan={1000}>
            <button>Custom Option</button>
          
            <MuiTablePagination
              component="div"
              count={count}
              rowsPerPage={rowsPerPage}
              page={page}
              labelRowsPerPage={textLabels.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${textLabels.displayRows} ${count}`}
              backIconButtonProps={{
                'aria-label': textLabels.previous,
              }}
              nextIconButtonProps={{
                'aria-label': textLabels.next,
              }}
              rowsPerPageOptions={[10,20,100]}
              onPageChange={this.handlePageChange}
              onRowsPerPageChange={this.handleRowChange}
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    );
  }

}

export default withStyles(CustomFooter, defaultFooterStyles, { name: "CustomFooter" });
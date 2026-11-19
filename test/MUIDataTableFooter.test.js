import React from 'react';
import { spy } from 'sinon';
import { mount } from 'enzyme';
import { assert } from 'chai';
import MuiTableFooter from '@mui/material/TableFooter';
import getTextLabels from '../src/textLabels';
import TableFooter from '../src/components/TableFooter';
import JumpToPage from '../src/components/JumpToPage';

describe('<TableFooter />', function () {
  let options;
  const changeRowsPerPage = spy();
  const changePage = spy();
  before(() => {
    options = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
    };
  });

  it('should render a table footer', () => {
    const mountWrapper = mount(
      <TableFooter
        options={options}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    const actualResult = mountWrapper.find(MuiTableFooter);
    assert.strictEqual(actualResult.length, 1);
  });

  it('should render a table footer with customFooter', () => {
    const customOptions = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      customFooter: (rowCount, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
        return (
          <MuiTableFooter>
            <tr>
              <td>Custom Footer</td>
            </tr>
          </MuiTableFooter>
        );
      },
    };

    const mountWrapper = mount(
      <TableFooter
        options={customOptions}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    const actualResult = mountWrapper.find(MuiTableFooter);
    assert.strictEqual(actualResult.length, 1);
  });

  it('should render a table footer with a static React element as customFooter', () => {
    const customOptions = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      customFooter: (
        <MuiTableFooter>
          <tr>
            <td id="static-custom-footer">Static Custom Footer</td>
          </tr>
        </MuiTableFooter>
      ),
    };

    const mountWrapper = mount(
      <TableFooter
        options={customOptions}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    assert.strictEqual(mountWrapper.find('#static-custom-footer').length, 1);
    assert.strictEqual(mountWrapper.find(JumpToPage).length, 0);
  });

  it('should not render a table footer', () => {
    const nonPageOption = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      pagination: false,
    };

    const mountWrapper = mount(
      <TableFooter
        options={nonPageOption}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    const actualResult = mountWrapper.find(MuiTableFooter);
    assert.strictEqual(actualResult.length, 0);
  });

  it('should render a JumpToPage component', () => {
    const options = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      jumpToPage: true,
    };

    const mountWrapper = mount(
      <TableFooter
        options={options}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    const actualResult = mountWrapper.find(JumpToPage);
    assert.strictEqual(actualResult.length, 1);
  });
});

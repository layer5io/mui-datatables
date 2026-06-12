import React from 'react';
import { spy } from 'sinon';
import { mount, shallow } from 'enzyme';
import { assert } from 'chai';
import MuiTablePagination from '@mui/material/TablePagination';
import getTextLabels from '../src/textLabels';
import TablePagination from '../src/components/TablePagination';

describe('<TablePagination />', function () {
  let options;

  beforeAll(() => {
    options = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
    };
  });

  it('should render a table footer with pagination', () => {
    const mountWrapper = mount(
      <table>
        <TablePagination options={options} count={100} page={1} rowsPerPage={10} changeRowsPerPage={() => {}} />
      </table>,
    );

    const actualResult = mountWrapper.find(MuiTablePagination);
    assert.strictEqual(actualResult.length, 1);
  });

  it('should trigger changePage prop callback when page is changed', () => {
    const changePage = spy();
    const wrapper = mount(
      <table>
        <TablePagination
          options={options}
          count={100}
          page={1}
          rowsPerPage={10}
          changePage={changePage}
          changeRowsPerPage={() => {}}
        />
      </table>,
    );

    const nextBtn = wrapper.find('#pagination-next').at(0);
    if (nextBtn.prop('onClick')) {
      nextBtn.prop('onClick')({ preventDefault: () => {} });
    } else {
      nextBtn.simulate('click');
    }
    wrapper.update();
    wrapper.unmount();

    assert.strictEqual(changePage.callCount, 1);
  });

  it('should correctly change page to be in bounds if out of bounds page was set', () => {
    const mountWrapper = mount(
      <table>
        <TablePagination options={options} count={5} page={1} rowsPerPage={10} changeRowsPerPage={() => {}} />
      </table>,
    );
    const actualResult = mountWrapper.find(MuiTablePagination).props().page;

    // material-ui v3 does some internal calculations to protect against out of bounds pages, but material v4 does not
    assert.strictEqual(actualResult, 0);
  });
});

import React, {
  useMemo,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  usePagination,
  useRowSelect,
} from "react-table";

import { GlobalFilter } from "../TableData/GlobalFilter";

import { ColumnFilter } from "../TableData/ColumnFilter";

import "./Table.css";

const Table = forwardRef((props, ref) => {
  //props.dataIn, columprops.isGroups,

  //console.log("hyyyyyyy");

  //console.log("tests",{props})
  const [data, setData] = useState([]);

  const [columns, setColumns] = useState([]);

  //!========================

  const [column, setColumn] = useState(-1);

  const [selectedId, setSelectedId] = useState(-1);

  const [column2, setColumn2] = useState(-1);

  const [selectedId2, setSelectedId2] = useState(-1);

  //!=========================

  const [clicks, setClicks] = useState(-1);

  //!=================

  const [grpid1, setGrpid1] = useState(-1);
  const [grpid2, setGrpid2] = useState(-1);

  const [childid1, setChildid1] = useState(-1);
  const [childid2, setChildid2] = useState(-1);

  const [childkey1, setChildkey1] = useState("");
  const [childkey2, setChildkey2] = useState("");

  useEffect(() => {
    setData(props.dataIn);
  }, [props.dataIn]);

  useEffect(() => {
    setColumns(props.columnsIn);
  }, [props.columnsIn]);

  const defaultColumn = useMemo(
    () => ({
      Filter: ColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows, //! this containes all the rows
    prepareRow,
    state,
    setGlobalFilter,
    page, //! this containes single page rows
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageSize: 8 }, //! cannot use initailState with pagnition
    },
    useFilters,
    useGlobalFilter,
    usePagination,
    useRowSelect
  );

  const getCellValue = (e, j) => {
    //console.log(e);
    // setCellValue((cellvalue) =>
    //   cellvalue === "blue" ? (cellvalue = "red") : (cellvalue = "blue")
    // );
    setSelectedId(e.row.id);
    setColumn(j);
  };




  const selectCellOne = (e, j) => {
    console.log("cell 1 ", j, e.row.index, data);

    setSelectedId(e.row.id);
    setColumn(j);



    var child_key = "child_" + (j - 1).toString() + "_id";

   // console.log("test dt -> ", data[e.row.index][child_key]);

    //!==

    setGrpid1(e.row.original.group_id);
    setChildid1(data[e.row.index][child_key]);
    setChildkey1(child_key);


  };

  const selectCellTwo = (e, j) => {
    console.log("cell 2 ", e.row.original);
    setSelectedId2(e.row.id);
    setColumn2(j);


    var child_key = "child_" + (j - 1).toString() + "_id";

    //console.log("test dt -> ", data[e.row.index][child_key]);

    //!==

    setGrpid2(e.row.original.group_id);
    setChildid2(data[e.row.index][child_key]);
    setChildkey2(child_key);

  };

  useImperativeHandle(ref, () => ({
    clearSelectedData() {
      setSelectedId(-1);
      setColumn(-1);
      setSelectedId2(-1);
      setColumn2(-1);
      setClicks(-1);
      //!==
      setGrpid1(-1);
      setGrpid2(-1);
      setChildid1(-1);
      setChildid2(-1);
      setChildkey1("");
      setChildkey2("");
    },

    swapMembers(){


      return {
        group_id_1: grpid1,
        id_1: childid1,
        id_1_key: childkey1,
        group_id_2: grpid2,
        id_2: childid2,
        id_2_key: childkey2,
      };

    },
  }));

  /*

  //! reset groups

  const resetGroups = () => {};

  //! swap memebers

  const swapMembers = () => {

  };

  //! cancelSelected

  const clearSelectedData = () => {
        setSelectedId(-1);
        setColumn(-1);
        setSelectedId(-1);
        setColumn(-1);
        setClicks(-1);
  };


  */

  const { globalFilter, pageIndex, pageSize } = state;

  var tableContent = (
    <>
      <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>
                  {column.render("Header")}
                  <div>{column.canFilter ? column.render("Filter") : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell, j) => {
                  return (
                    <td
                      onClick={
                        props.isGroups
                          ? () => {
                              var crr_clicks = clicks + 1;

                              if (crr_clicks > 1) {
                                crr_clicks = 0;
                              }

                              setClicks(crr_clicks);

                              if (crr_clicks === 0) {
                                selectCellOne(cell, j);
                              }

                              if (crr_clicks === 1) {
                                selectCellTwo(cell, j);
                              }

                              console.log({ crr_clicks });

                              //console.log({ j });
                              // getCellValue(cell, j);
                            }
                          : () => {}
                      }
                      style={
                        props.isGroups
                          ? {
                              padding: "10px",
                              border: "solid 1px gray",
                              cursor: "pointer",
                              background:
                                selectedId === row.id && column === j
                                  ? "#3385ff"
                                  : selectedId2 === row.id && column2 === j
                                  ? "#ff8533"
                                  : "white",
                            }
                          : {}
                      }
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot></tfoot>
      </table>

      {/** PAG */}

      <div id="pagbottom">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          Previous
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          Next
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const pageNumber = e.target.value
                ? Number(e.target.value) - 1
                : 0;
              gotoPage(pageNumber);
            }}
            style={{ width: "50px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[6, 15, 25].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  return tableContent;
});

export default Table;


import React, { useState } from "react";
// import { format } from "date-fns";


export function dateBetweenFilterFn(rows, id, filterValues) {
  const sd = filterValues[0] ? new Date(filterValues[0]) : undefined;
  const ed = filterValues[1] ? new Date(filterValues[1]) : undefined;

  console.log("here")
  if (ed || sd) {
    return rows.filter((r) => {


     console.log("test ",r.values[id]);
      // format data
      var dateAndHour = r.values[id].split("T");
      var [year, month, day] = dateAndHour[0].split("-");
      var date = [month, day, year].join("/");
      var hour = dateAndHour[1];
      var formattedData = date + " " + hour;

      //console.log(formattedData);

      const cellDate = new Date(formattedData);

      //const cellDate = format(new Date(formattedData), "dd/MM/yyyy");

      //console.log({ formattedData , sd ,ed ,cellDate });

      if (ed && sd) {
        return cellDate >= sd && cellDate <= ed;
      } else if (sd) {
        return cellDate >= sd;
      } else {
        return cellDate <= ed;
      }
    });
  } else {


    return rows;

    //console.log(rows)
    //return format(new Date(rows), "dd/MM/yyyy");
  }
}



export function DateRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length
      ? new Date(preFilteredRows[0].values[id])
      : new Date(0);
    let max = preFilteredRows.length
      ? new Date(preFilteredRows[0].values[id])
      : new Date(0);

    preFilteredRows.forEach((row) => {
      const rowDate = new Date(row.values[id]);

      min = rowDate <= min ? rowDate : min;
      max = rowDate >= max ? rowDate : max;
    });

    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div>
      <input
        //min={min.toISOString().slice(0, 10)}
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [val ? val : undefined, old[1]]);
        }}
        type="date"
        value={filterValue[0] || ""}
      />
      {" to "}
      <input
        //max={max.toISOString().slice(0, 10)}
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? val.concat("T23:59:59.999Z") : undefined,
          ]);
        }}
        type="date"
        value={filterValue[1]?.slice(0, 10) || ""}
      />
    </div>
  );
}
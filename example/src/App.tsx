import * as React from "react";
import { useTranslation } from "react-i18next";
import { BaseTable } from "../../src/ui/BaseTable";
import { Button } from "../../src/ui/button";
import { DateField } from "../../src/ui/DateField";
import { DateOfBirthSelector } from "../../src/ui/DateOfBirthSelector";
import { MultiSelect } from "../../src/ui/multi-select";
import {
  MVPSelect,
  MVPSelectContent,
  MVPSelectInput,
  MVPSelectItem,
  MVPSelectItems,
  MVPSelectTrigger,
} from "../../src/ui/SelectCommand";

const tableColumns = [
  {
    accessorKey: "name",
    header: "Name",
    column_name: "Name",
    cell: ({ row }: any) => row.original.name,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    column_name: "Status",
    cell: ({ row }: any) => row.original.status,
    enableHiding: true,
  },
];

const tableData = [
  { id: 1, name: "Ana", status: "Active" },
  { id: 2, name: "Luis", status: "Pending" },
  { id: 3, name: "Marta", status: "Closed" },
];

const multiSelectOptions = [
  { value: "one", label: "First option" },
  { value: "two", label: "Second option" },
  { value: "three", label: "Third option" },
  { value: "four", label: "Fourth option" },
  { value: "five", label: "Fifth option" },
  { value: "six", label: "Sixth option" },
];

const selectCommandOptions = [
  { value: "india", label: "India" },
  { value: "spain", label: "Spain" },
  { value: "germany", label: "Germany" },
];

export default function App() {
  const { i18n } = useTranslation(["common", "bx_v1", "course.find_course"]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [dob, setDob] = React.useState("");
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  const [singleSelectValue, setSingleSelectValue] = React.useState("");

  const datePlaceholder =
    i18n.language === "es-es" ? "Selecciona una fecha" : "Pick a date";
  const dobPlaceholder =
    i18n.language === "es-es" ? "Fecha de nacimiento" : "Date of birth";
  const selectPlaceholder =
    i18n.language === "es-es" ? "Selecciona un elemento" : "Select an item";

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-8 text-[#333333]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">pf-common-components example</h1>
            <p className="text-sm text-grey1">Current locale: {i18n.language}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => i18n.changeLanguage("en")} variant="outline">
              English
            </Button>
            <Button
              onClick={() => i18n.changeLanguage("es-es")}
              variant="outline"
            >
              Espanol
            </Button>
          </div>
        </div>

        <section className="grid gap-4 rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">BaseTable</h2>
          <BaseTable
            columns={tableColumns as any}
            data={tableData}
            columnSelector
            pagination
            pageCount={3}
            current={1}
            pageSize={2}
            total={6}
          />
        </section>

        <section className="grid gap-6 rounded-2xl border bg-white p-6 md:grid-cols-2">
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">DateField</h2>
            <DateField
              value={selectedDate}
              onChange={setSelectedDate as any}
              placeholder={datePlaceholder}
            />
          </div>

          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">DateOfBirthSelector</h2>
            <DateOfBirthSelector
              value={dob}
              onChange={setDob}
              placeholder={dobPlaceholder}
              fromDate={new Date(1950, 0, 1)}
              toDate={new Date()}
            />
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border bg-white p-6 md:grid-cols-2">
          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">MultiSelect</h2>
            <MultiSelect
              placeholder={selectPlaceholder}
              data={multiSelectOptions}
              value={selectedValues}
              onChange={setSelectedValues}
              onSearch={() => {}}
              onBottomReached={() => {}}
            />
          </div>

          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">SelectCommand</h2>
            <MVPSelect value={singleSelectValue} onChange={setSingleSelectValue}>
              <MVPSelectTrigger placeholder={selectPlaceholder} />
              <MVPSelectContent>
                <MVPSelectInput />
                <MVPSelectItems>
                  {selectCommandOptions.map((option) => (
                    <MVPSelectItem
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    >
                      {option.label}
                    </MVPSelectItem>
                  ))}
                </MVPSelectItems>
              </MVPSelectContent>
            </MVPSelect>
          </div>
        </section>
      </div>
    </main>
  );
}

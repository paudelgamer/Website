"use client";
import "./page.css";
import { Children } from "react";
import { useEffect, useState } from "react";
import papa from "papaparse";
import { row } from "mathjs";
import DataFilter from "./DataFilter";

//just simple fxn to calculate age from date

//this Fxn works....better leave it that way

export default function Compare() {
  const [showComparisonPage, setShowComparisonPage] = useState(true);

  const [csvData, setCsvData] = useState([]);
  const [addonNames, setAddonNames] = useState([]);
  const [comparisonResult, setComparisonResult] = useState([]);

  function handleButtonClick(_) {
    setShowComparisonPage(!showComparisonPage);
    getData();
  }

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    insuredAmount: "",
    income: "",
    // type: "",
    // gender: "",
    // phoneNumber: "",
    // dob: "",
    insuredTerm: "",
    // occupation: "",
  });


  function getData() {
    const nameElement = document.getElementById("nameField");
    const insuredTerm = nameElement.parentElement.children[1].value;
    const insuredAmount = nameElement.parentElement.children[2].value;
    const income = nameElement.parentElement.children[3].value;
    const term = document.querySelector('input[name="term"]:checked')?.value;
    const gender = document.querySelector(
      'input[name="gender"]:checked',
    )?.value;

    const type = document.querySelector('input[name="type"]:checked')?.value;
    const age =
      nameElement.parentElement.parentElement.children[1].children[3].value;
    if (
      nameElement.value != "" &&
      age != "" &&
      insuredAmount != "" &&
      income != "" &&
      insuredTerm != "" &&
      gender != ""
    ) {
      // Retrieve the parent elements and their children correctly
      const phoneNumber = nameElement.parentElement.children[4].value;

      const occupation =
        nameElement.parentElement.parentElement.children[1].children[4].value;

      // Update the state with form data
      setFormData({
        name: nameElement.value, // Correctly get the value
        insuredTerm, //10, 15...
        insuredAmount,
        income,
        type: (type == 1 | type == 2 | type == 3) ? type : 0, // endowment/ termlife/ ...
        gender,
        phoneNumber,
        age,
        term, //yly, hly, mly,...
        occupation,
      });
    }
  }

  // runs at start; used to fetch and parse csv file
  useEffect(() => {
    let term = document.getElementById("preselect"); //for default checkbox
    term.click();

    fetch("/AllPolicy/filter.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const result = papa.parse(csvText, { header: false });
        setCsvData(result.data);
      })
      .catch((error) => console.error("Error fetching CSV:", error));

    fetch("/AllPolicy/addons_names.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const result = papa.parse(csvText, { header: true });
        setAddonNames(result.data);
      })
      .catch((error) => console.error("Error fetching CSV:", error));
  }, []);

  // activates each time csvData fetch from file and formData from user changes
  useEffect(() => {
    console.log(formData)
    if (formData.name != "") {
      let filteredData = DataFilter(formData)
      let tab;
      let premium;
      for (let i = 0; i < filteredData.length; i++) {

        let loadingCharge = 0.3
        let insuranceRebate = 20000

        fetch(`/AllPolicy/${filteredData[i].policy}.csv`)
          .then((response) => response.text())
          .then((csvText) => {
            tab = papa.parse(csvText, { header: true }).data
            premium = (tab[formData.age - filteredData[i].minEntry][formData.insuredTerm] * loadingCharge - insuranceRebate) * formData.insuredAmount / 1000;
            filteredData[i].premium = premium
          })
          .catch((error) => console.error("Error fetching CSV:", error));
      }

      setComparisonResult(filteredData);
    }
  }, [formData]);


  return (
    <>
      {showComparisonPage ? (
        < div id="compareContainer">
          <div className="compareContents" id="searchPlans">
            <h1>
              <span id="searchSpan">Search</span>
              <span id="planSpan">Plans</span>
            </h1>
            <p className="fattext">
              Choosing the right plan can be a crucial decision for your needs,
              whether you’re an individual, a small business, or a large
              enterprise. To help you make the best choice, we’ve outlined the
              key features and benefits of each of our plans below. Compare and
              select the plan that suits you best.
            </p>
          </div>

          <div className="surrounddatafields">
            <form className="compareContents" id="endowmentdatafields">
              <div id="datafieldLeft">
                <input
                  type="text"
                  placeholder="Name"
                  id="nameField"
                  className="optional"
                />
                <input
                  type="text"
                  placeholder="Insured Term"
                  id="insuredTermField"
                />
                <input
                  type="text"
                  placeholder="Insured Amount"
                  id="insuredAmmountField"
                />
                <input type="text" placeholder="Income" id="incomeField" />
                <input
                  type="text"
                  placeholder="Phone Number(optional)"
                  id="phoneField"
                  className="optional"
                />
              </div>
              <div id="datafieldRight">
                <span id="gender">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    className="optional"
                  />{" "}
                  Male
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    className="optional"
                  />{" "}
                  Female
                </span>
                <span id="type">
                  <input type="radio" name="type" value="1" /> Endowment
                  <input type="radio" name="type" value="2" /> Term Life
                  <input type="radio" name="type" value="3" /> Money
                  Back
                </span>

                <span id="term">
                  <input type="radio" name="term" value="Monthly" /> Monthly
                  <input type="radio" name="term" value="Quarterly" /> Quarterly
                  <input type="radio" name="term" value="Half-Yearly" />{" "}
                  Half-Yearly
                  <input
                    id="preselect"
                    type="radio"
                    name="term"
                    value="Yearly"
                    aria-checked="true"
                  />{" "}
                  Yearly
                </span>
                <input
                  type="text"
                  placeholder="Date Of Birth  (B.S.)"
                  id="dobField"
                />
                <input
                  type="text"
                  placeholder="Occupation(optional)"
                  id="occupationField"
                  className="optional"
                />
                <button
                  className="mainButton"
                  onClick={handleButtonClick}
                  type="button"
                >
                  Compare
                </button>
              </div>
            </form>
          </div>

          <div id="chooseBreak"></div>
        </div >
      ) : (
        <>
          <div id="majorView">
            <div id="filterinfoicon">ⓘ<span id="filterinfo">Click on a addon to filter the policies</span></div>
            <nav id="filter">
              {
                addonNames.map((addon, index) => {
                  if (addon["Add-on Number"] != "") {
                    return (
                      <div key={index} className="filterAddons">
                        <input type="checkbox" name={addon["Add-on Name"]} id={addon["Add-on Number"]} />
                        <label htmlFor={addon["Add-on Number"]}>{addon["Add-on Name"]}</label>
                      </div>
                    );
                  }
                })
              }
            </nav>
          </div>
          {
            comparisonResult.map((policy, index) => {
              return (
                <div key={index} className="filteredPolicies">
                  <h1>{policy["policy"]}</h1>
                  Premium: {policy["premium"]}. CSR: {}. Addons:{}
                </div>
              );
            })
          }
        </>
      )
      }
    </>
  );
}

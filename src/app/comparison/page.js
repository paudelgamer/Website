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
  const [selectedAddons, setSelectedAddons] = useState([]);
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

    fetch("/AllPolicy/addons_names_cost.csv")
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
        
        fetch("/AllPolicy/loadingcharge.csv")
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

function calculateLoadingCharge(filteredData, term) {
  let loadingCharge = 1; // Default loading charge

  // Define policies for each company
  const company1Policies = [1, 2, 3, 10, 11, 16, 17];
  const company2Policies = [4, 5, 6, 12, 13, 18, 19];
  const company3Policies = [7, 8, 9, 14, 15, 20, 21];

  // Define loading charges for payment methods
  const loadingData = {
      "1": { loading1: 1, loading2: 1.01, loading3: 1.03 },
      "0.5": { loading1: 0.98, loading2: 1.0, loading3: 1.2 },
      "0.25": { loading1: 0.97, loading2: 0.99, loading3: 1.5 },
      "0.083": { loading1: 0.95, loading2: 1.2, loading3: 1.7 },
  };

  // Determine the company based on the policy number
  if (company1Policies.includes(filteredData.policy)) {
      // Company 1
      if (term in loadingData) {
          loadingCharge = loadingData[FormData.term].loading1;
      }
  } else if (company2Policies.includes(filteredData.policy)) {
      // Company 2
      if (term in loadingData) {
          loadingCharge = loadingData[FormData.term].loading2;
      }
  } else if (company3Policies.includes(filteredData.policy)) {
      // Company 3
      if (term in loadingData) {
          loadingCharge = loadingData[FormData.term].loading3;
      }
  } else {
      console.log("Invalid policy number or term");
  }

  return loadingCharge;
}

function calculateInsuranceRebate(filteredData, FormData) {
  // Rebate data: [min, max, rebate1, rebate2, rebate3]
  const rebateData = [
      { min: 25000, max: 49000, rebate1: 0.5, rebate2: 0.25, rebate3: 1 },
      { min: 50000, max: 99000, rebate1: 1.0, rebate2: 0.5, rebate3: 1.25 },
      { min: 100000, max: 199000, rebate1: 1.5, rebate2: 1.0, rebate3: 1.75 },
      { min: 200000, max: 99999999999, rebate1: 2.0, rebate2: 2.0, rebate3: 2.5 },
  ];

  // Define policies for each company
  const company1Policies = [1, 2, 3, 10, 11, 16, 17];
  const company2Policies = [4, 5, 6, 12, 13, 18, 19];
  const company3Policies = [7, 8, 9, 14, 15, 20, 21];

  let rebateAmount = 0;

  // Identify the company based on the policy number
  if (company1Policies.includes(filteredData.policy)) {
      // Company 1: Use rebate1
      rebateAmount = getRebate(FormData.insuredAmount, rebateData, "rebate1");
  } else if (company2Policies.includes(filteredData.policy)) {
      // Company 2: Use rebate2
      rebateAmount = getRebate(FormData.insuredAmount, rebateData, "rebate2");
  } else if (company3Policies.includes(filteredData.policy)) {
      // Company 3: Use rebate3
      rebateAmount = getRebate(FormData.insuredAmount, rebateData, "rebate3");
  } else {
      console.log("Invalid policy number");
      return 0; // No rebate if policy number is invalid
  }

  return rebateAmount;
}

// Helper function to determine the rebate based on insured amount and column
function getRebate(insuredAmount, rebateData, rebateKey) {
  for (let rebate of rebateData) {
      if (insuredAmount >= rebate.min && insuredAmount <= rebate.max) {
          return rebate[rebateKey];
      }
  }
  return 0; // Default rebate if no range matches
}

// Example usage
const filteredData = { policy: 1 }; // Example policy number
const FormData = { insuredAmount: 75000 }; // Example insured amount (75,000 Rs)

const rebate = calculateInsuranceRebate(filteredData, FormData);
console.log("Total Insurance Rebate:", rebate);


function calculateAddonsCost(FormData, selectedAddons) {
  // Define the cost of add-ons per 1000 Rs insured
  const addonsData = {
      "1": 1, // Accidental Death Benefit
      "2": 5, // Termrider
      "3.1": 2, // Critical Illness Payout
      "3.2": 1, // Critical Illness No Premium Pay
      "4": 10, // Spouse Rider
      "5.1": 2, // Disability Payout
      "5.2": 1, // Disability No Premium Pay
      "6": 1, // Child Education Rider
      "7": 3, // Hospital Rider
      "8": 1, // Time Extension Rider
      "9": 0.25, // Funeral Expense Rider
      "10": 10, // Employment Loss No Premium Rider
      "11": 5, // Travel Add-on
      "12": 3 // Premium Return in Term Life
  };

  let addonsCostTotal = 0;

  // Calculate total add-ons cost
  selectedAddons.forEach((addon) => {
      if (addonsData[addon]) {
          const costPer1k = addonsData[addon];
          const insuredAmountInThousands = FormData.insuredAmount / 1000;
          addonsCostTotal += costPer1k * insuredAmountInThousands;
      } else {
          console.log(`Add-on ${addon} not found in the database.`);
      }
  });

  return addonsCostTotal;
}

  }, [formData]);


  const handleAddonChange = (event) => {
    const addonNumber = event.target.id;

    // If checkbox is checked, add to array; if unchecked, remove from array
    setSelectedAddons(prevSelectedAddons =>
      event.target.checked
        ? [...prevSelectedAddons, addonNumber]
        : prevSelectedAddons.filter(addon => addon !== addonNumber)
    );
  };


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
                  <input type="radio" name="term" value="0.083" /> Monthly
                  <input type="radio" name="term" value="0.25" /> Quarterly
                  <input type="radio" name="term" value="0.5" />{" "}
                  Half-Yearly
                  <input
                    id="preselect"
                    type="radio"
                    name="term"
                    value="1"
                    aria-checked="true"
                  />{" "}
                  Yearly
                </span>
                <input
                  type="text"
                  placeholder="Age"
                  id="ageField"
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
            <h1> Choose an Add-on </h1>
            <div id="filterinfoicon">ⓘ<span id="filterinfo">Click on a addon to filter the policies</span></div>
            <h3> Free Add-on </h3>
            <div id="filterFree" className="filter">
              {
                addonNames.map((addon, index) => {
                  if ((addon["Add-on Number"] != "") && (addon["Costper1k"] == "0")) {
                    return (
                      <div key={index} className="filterAddons">
                        <input type="checkbox" name={addon["Add-on Name"]} id={addon["Add-on Number"]} onChange={handleAddonChange} />
                        <label htmlFor={addon["Add-on Number"]}>{addon["Add-on Name"]}</label>
                      </div>
                    );
                  }
                })
              }
            </div>
            <h3> Paid Add-on </h3>
            <div id="filterFree" className="filter">
              {
                addonNames.map((addon, index) => {
                  if ((addon["Add-on Number"] != "") && (addon["Costper1k"] != "0")) {
                    return (
                      <div key={index} className="filterAddons">
                        <input type="checkbox" name={addon["Add-on Name"]} id={addon["Add-on Number"]} onChange={handleAddonChange} />
                        <label htmlFor={addon["Add-on Number"]}>{addon["Add-on Name"]}</label>
                      </div>
                    );
                  }
                })
              }
            </div>
            <button id="AddonAccept" onClick={() => {
              document.getElementById("majorView").style.display = "none";
            }} > Accept Selection </button>
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



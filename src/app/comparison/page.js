"use client";
import "./page.css";
import path from "path";
import { Children } from "react";
import { useEffect, useState } from "react";
import papa from "papaparse";
import { row } from "mathjs";
import DataFilter from "./DataFilter";
import "../api/runai.js";
import { runPythonScript } from "../api/runai.js";

export default function Compare() {
  const [showComparisonPage, setShowComparisonPage] = useState(true);
  // Define policies for each company
  const company1Policies = [1, 2, 3, 10, 11, 16, 17];
  const company2Policies = [4, 5, 6, 12, 13, 18, 19];
  const company3Policies = [7, 8, 9, 14, 15, 20, 21];

  const [selectedAddons, setSelectedAddons] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [addonNames, setAddonNames] = useState([]);
  const [comparisonResult, setComparisonResult] = useState([]);

  async function getpred(datastr) {
    console.log("from getpred 1")
    const result = await runPythonScript(datastr);
    console.log("from getpred 2", result)
  }
  function handleButtonClick(_) {
    setShowComparisonPage(!showComparisonPage);
    getData();
    getpred('data1')
    console.log("fetched udata")
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
    console.log(formData);
    if (formData.name !== "") {
      let filteredData = DataFilter(formData);
      let premium;

      // Loop through filtered data and calculate premium for each policy
      for (let i = 0; i < filteredData.length; i++) {
        // Fetch loading charge (you can consider caching it if it doesn't change often)
        fetch("/AllPolicy/loadingcharge.csv")
          .then((response) => response.text())
          .then((csvText) => {
            const loadingCharge = 0.3; // default loading charge, can be dynamically loaded
            const insuranceRebate = 20000; // rebate value

            // Fetch the policy CSV file
            fetch(`/AllPolicy/${filteredData[i].policy}.csv`)
              .then((response) => response.text())
              .then((csvText) => {
                const tab = papa.parse(csvText, { header: true }).data;

                // 1. Get the tab rate for the selected age and insured term
                const tabRate = tab[formData.age - filteredData[i].minEntry][formData.insuredTerm];

                // 2. Multiply by loading charge
                const loadedPremium = tabRate * loadingCharge;

                // 3. Subtract rebate (based on the insured amount and company)
                const rebate = calculateInsuranceRebate(filteredData[i], formData);
                const premiumAfterRebate = loadedPremium - rebate;

                // 4. Multiply by the insured amount
                premium = premiumAfterRebate * formData.insuredAmount;

                // 5. Divide by 1000
                premium = premium / 1000;
                // 6. Add addons cost
                const addonsCost = calculateAddonsCost(formData, selectedAddons);
                premium += addonsCost;

                // Set the calculated premium for this policy
                filteredData[i].premium = premium;

                setComparisonResult(
                  filteredData.map((arr, index) => {
                    let policy_addons = arr["policy"] == 1 ? [1, 2, 3.1, 5.2, 7, 10, 65, 66, 68, 70] :
                      arr["policy"] == 2 ? [1, 2, 4, 6, 8, 11, 65, 67, 69, 71] :
                        arr["policy"] == 3 ? [1, 2, 3.2, 5.1, 9, 11, 65, 66, 67, 70] :
                          arr["policy"] == 4 ? [1, 2, 4, 7, 8, 10, 65, 68, 69, 71] :
                            arr["policy"] == 5 ? [1, 2, 3.1, 6, 9, 10, 65, 66, 69, 70] :
                              arr["policy"] == 6 ? [1, 2, 5.2, 7, 8, 11, 65, 67, 68, 71] :
                                arr["policy"] == 7 ? [1, 2, 3.2, 6, 8, 10, 65, 66, 67, 69] :
                                  arr["policy"] == 8 ? [1, 2, 4, 5.1, 9, 11, 65, 68, 70, 71] :
                                    arr["policy"] == 9 ? [1, 2, 3.1, 7, 8, 11, 65, 66, 69, 71] :
                                      arr["policy"] == 10 ? [1, 2, 4, 6, 9, 10, 65, 67, 68, 70] :
                                        arr["policy"] == 11 ? [1, 2, 3.2, 5.2, 7, 11, 65, 66, 67, 71] :
                                          arr["policy"] == 12 ? [1, 2, 4, 6, 8, 9, 65, 68, 69, 70] :
                                            arr["policy"] == 13 ? [1, 2, 3.1, 6, 7, 11, 65, 66, 70, 71] :
                                              arr["policy"] == 14 ? [1, 2, 4, 5.1, 8, 10, 65, 67, 69, 70] :
                                                arr["policy"] == 15 ? [1, 2, 3.2, 6, 9, 10, 65, 66, 68, 71] :
                                                  arr["policy"] == 16 ? [1, 2, 3.1, 7, 9, 12, 66, 68, 69, 71] :
                                                    arr["policy"] == 17 ? [1, 2, 4, 8, 11, 12, 67, 68, 70, 71] :
                                                      arr["policy"] == 18 ? [1, 2, 5.1, 6, 10, 12, 66, 67, 69, 70] :
                                                        arr["policy"] == 19 ? [1, 2, 3.2, 8, 11, 12, 66, 68, 70, 71] :
                                                          arr["policy"] == 20 ? [1, 2, 4, 6, 9, 12, 67, 69, 70, 71] :
                                                            arr["policy"] == 21 ? [1, 2, 5.2, 7, 10, 12, 66, 67, 68, 69] : []

                    // ADDONS FILTER
                    for (let j = 0; j < selectedAddons.length; j++) {
                      if (!policy_addons.includes(selectedAddons[j])) {
                        filteredData.splice(i, 1);
                      }
                    }

                    let policy_num = arr["policy"]
                    return (
                      <div key={index} className="filteredPolicies">
                        <h2>
                          {
                            (company1Policies.includes(policy_num)) ? "Himalayan Life Insurance" :
                              (company2Policies.includes(policy_num)) ? "Life Insurance Corporation Nepal" :
                                (company3Policies.includes(policy_num)) ? "Nepal Life" : ""
                          }
                        </h2>
                        <div className="cardspolicynum">{policy_num}</div>
                        <div className="cardspremium">Rs {Math.floor(arr["premium"] * 100) / 100} </div>
                        <div className="cardscsr">{
                          (company1Policies.includes(policy_num)) ? 83 :
                            (company2Policies.includes(policy_num)) ? 95 :
                              (company3Policies.includes(policy_num)) ? 87 : 0
                        }
                        </div>
                        <div className="cardsaddons">
                          Addons: {
                            policy_addons.map((addon, index) => {
                              let addonName = ""
                              if (addon == 1) {
                                addonName = "Accident Death Benefit"
                              } else if (addon == 2) {
                                addonName = "Termrider"
                              } else if (addon == 3) {
                                addonName = "Critical Illness Payout"
                              } else if (addon == 4) {
                                addonName = "Spouse Rider"
                              } else if (addon == 5) {
                                addonName = "Disability Payout"
                              } else if (addon == 6) {
                                addonName = "Child Education Rider"
                              } else if (addon == 7) {
                                addonName = "Hospital Rider"
                              } else if (addon == 8) {
                                addonName = "Time Extension Rider"
                              } else if (addon == 9) {
                                addonName = "Funeral Expense Rider"
                              } else if (addon == 10) {
                                addonName = "Employment Loss No Premium Rider"
                              } else if (addon == 11) {
                                addonName = "Travel Add-on"
                              } else if (addon == 12) {
                                addonName = "Premium Return in Term Life"
                              } else if (addon == 65) {
                                addonName = "Loan Against Insured Amount"
                              } else if (addon == 66) {
                                addonName = "Grace Period for Pay"
                              } else if (addon == 67) {
                                addonName = "Discount for Salaried Employees"
                              } else if (addon == 68) {
                                addonName = "Online Discount"
                              } else if (addon == 69) {
                                addonName = "Free Annual Health Checkup Whole Body"
                              } else if (addon == 70) {
                                addonName = "Free Lookup Period"
                              } else if (addon == 71) {
                                addonName = "Policy Conversion"
                              }
                              return <span key={index}> {addonName} </span>
                            })
                          }
                        </div>
                      </div>
                    )
                  })
                )
              })
              .catch((error) => console.error("Error fetching CSV:", error));
          })
          .catch((error) => console.error("Error fetching loading charge:", error));
      }

       
    setComparisonResult(
      filteredData.map((arr, index) => {
        return (
          <div key={index} className="filteredPolicies">
            <h1>{arr["policy"]}</h1>
            Premium: {arr?.premium ? arr.premium : 'N/A'}. CSR: {}. Addons: {}
          </div>
        );
      })
    )
    }


  }, [formData, selectedAddons]);  // Add selectedAddons to trigger calculation when it changes



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
                  <input type="radio" name="type" value="3" /> Term Life
                  <input type="radio" name="type" value="2" /> Money
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
          <div id="policyCards">
            {comparisonResult}
          </div>

        </>
      )
      }
    </>
  );
}


//calculateAddonsCost
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

//calculateLoadingCharge
function calculateLoadingCharge(filteredData, term) {
  let loadingCharge = 1; // Default loading charge


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


//calculateInsuranceRebate
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

  if (filteredData.policy >= 15 && filteredData.policy <= 21) {
    rebateAmount /= 10; // Reduce rebate to 10%
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



/*
// Function to fetch and parse CSV file data
async function fetchTabRateData(policyNumber) {
  const csvDirectoryPath = `/AllPolicy`; // Use the correct path here for your static files
  const filePath = `${csvDirectoryPath}/${policyNumber}.csv`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`File for policy ${policyNumber} not found.`);
    }
    const csvText = await response.text();
    return papa.parse(csvText, { header: true }).data;
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return null;
  }
}

// Function to find the Tab Rate from the CSV data
function findTabRate(tabRateData, age, insuredTerm) {
  const ageRow = tabRateData.find(row => parseInt(row.Age) === age);

  if (!ageRow) {
    console.error(`Age ${age} not found in the tab rate data.`);
    return null; // Return null if the age isn't found
  }

  const insuredTermColumn = Object.keys(ageRow).find(key => parseInt(key) === insuredTerm);

  if (!insuredTermColumn) {
    console.error(`Insured term ${insuredTerm} not found in the tab rate data.`);
    return null; // Return null if the insured term isn't found
  }

  return parseFloat(ageRow[insuredTermColumn]);
}

// Function to calculate the tab rate for a policy number, age, and insured term
async function calculateTabRate(policyNumber, age, insuredTerm) {
  const tabRateData = await fetchTabRateData(policyNumber);

  if (tabRateData === null) {
    return null;
  }

  return findTabRate(tabRateData, age, insuredTerm);
}

// Usage Example
async function getTabRate(policyNumber, age, insuredTerm) {
  const tabRate = await calculateTabRate(policyNumber, age, insuredTerm);
  if (tabRate !== null) {
    console.log(`Tab Rate: ${tabRate}`);
  } else {
    console.log('Tab Rate not found.');
  }
}
*/

// Function to find the Tab Rate for Endowment and Money Back policies
function findTabRateForEndowmentOrMoneyBack(tabRateData, age, insuredTerm) {
  const ageRow = tabRateData.find(row => parseInt(row.Age) === age);

  if (!ageRow) {
    console.error(`Age ${age} not found in the tab rate data.`);
    return null; // Return null if the age isn't found
  }

  const insuredTermColumn = Object.keys(ageRow).find(key => parseInt(key) === insuredTerm);

  if (!insuredTermColumn) {
    console.error(`Insured term ${insuredTerm} not found in the tab rate data.`);
    return null; // Return null if the insured term isn't found
  }

  return parseFloat(ageRow[insuredTermColumn]);
}

// Function to find the Tab Rate for Term Life policies
function findTabRateForTermLife(tabRateData, age, policyNumber) {
  const ageRow = tabRateData.find(row => parseInt(row.Index) === age);

  if (!ageRow) {
    console.error(`Age ${age} not found in the tab rate data.`);
    return null; // Return null if the age isn't found
  }

  const policyColumn = Object.keys(ageRow).find(key => parseInt(key) === policyNumber);

  if (!policyColumn) {
    console.error(`Policy number ${policyNumber} not found in the tab rate data.`);
    return null; // Return null if the policy number isn't found
  }

  return parseFloat(ageRow[policyColumn]);
}

// Function to calculate the Tab Rate based on the policy type
async function calculateTabRate(policyNumber, age, insuredTerm) {
  const tabRateData = await fetchTabRateData(policyNumber);

  if (!tabRateData) {
    return null;
  }

  // Determine policy type
  if (policyNumber >= 1 && policyNumber <= 9) {
    // Endowment
    return findTabRateForEndowmentOrMoneyBack(tabRateData, age, insuredTerm);
  } else if (policyNumber >= 10 && policyNumber <= 15) {
    // Money Back
    return findTabRateForEndowmentOrMoneyBack(tabRateData, age, insuredTerm);
  } else if (policyNumber >= 16 && policyNumber <= 21) {
    // Term Life
    return findTabRateForTermLife(tabRateData, age, policyNumber);
  } else {
    console.error(`Invalid policy number ${policyNumber}.`);
    return null;
  }
}

// Fetch the Tab Rate data based on policy type
async function fetchTabRateData(policyNumber) {
  let url;
  if (policyNumber >= 1 && policyNumber <= 9) {
    // Fetch Endowment data
    url = '/path/to/endowment/data.csv';
  } else if (policyNumber >= 10 && policyNumber <= 15) {
    // Fetch Money Back data
    url = '/path/to/moneyback/data.csv';
  } else if (policyNumber >= 16 && policyNumber <= 21) {
    // Fetch Term Life data
    url = '/path/to/termlife/data.csv';
  } else {
    console.error(`Invalid policy number ${policyNumber}.`);
    return null;
  }

  try {
    const response = await fetch(url);
    const csvData = await response.text();
    const parsedData = papa.parse(csvData, { header: true, skipEmptyLines: true });
    return parsedData.data;
  } catch (error) {
    console.error(`Failed to fetch data for policy number ${policyNumber}:`, error);
    return null;
  }
}


import pandas as pd
import json
import numpy as np
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import LinearRegression

# Load the data
data = pd.read_csv('AI/data.csv')

# Select features
features = ['Age', 'Income', 'Premium Amount', 'Insured Years', 
           'Payment Type', 'Insured Amount', 'Percentage of Payment']


payment_type = {
        'yearly':1.0,
        'half_yearly': 0.5,
        'quarterly': 0.25,  
        'monthly': 0.083
        }
data['Payment Type'] = data['Payment Type'].map(payment_type)
# Prepare X (features) and y (target)
# Prepare X (features) and y (target)
X = data[features[:-1]].values  
y = data[features[-1]].values   

# Scale the features
scaler_x = StandardScaler()
X_scaled = scaler_x.fit_transform(X)

# Create polynomial features and fit model
poly_features = PolynomialFeatures(degree=2)
X_poly = poly_features.fit_transform(X_scaled)
model = LinearRegression()
model.fit(X_poly, y)
print(model.coef_)

# Function to make predictions
def predict_insurance_payment(age, income, premium, insured_years, payment_type, insured_amount):
    new_data = np.array([[age, income, premium, insured_years, payment_type, insured_amount]])
    new_data_scaled = scaler_x.transform(new_data)
    new_data_poly = poly_features.transform(new_data_scaled)
    return model.predict(new_data_poly)[0]

with open('AI//data/userData.json', 'r') as file:
    data = json.load(file)

prediction = predict_insurance_payment(data['Age'], data['Income'], data['Premium Amount'], data['Insured Years'], data['Payment Type'], data['Insured Amount'])

print("the prediction from python file is : ", prediction)

# export default function runai(){
# const {exec} = require('child_process');
#  var prediction = exec('python3 ./poly2.py', (error, stdout, stderr)=>{
#      if(error){
#          console.error('Error: ${error.message}');
#          return;
#      }
#      if(stderr){
#          console.error('stderr: ${stderr}');
#          return;
#      }
#      console.log('std: ${stdout}');
#  })
#  console.log("the prediction is :",prediction)
# }

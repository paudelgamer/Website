import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


data = pd.read_csv('data.csv')
x = data['Income']
y = data['Percentage of Payment']

degree = 3
sums = []
sumsy = []

for i in range(2*degree+1):
    sums.append(np.sum(x**i))
    sumsy.append(np.sum(y*(x)**i))
    
X = []
for i in range(degree+1):
    X.append(sums[i:i+degree+1])


X = np.array(X)
X_inv = np.linalg.inv(X)

coef = np.dot(X_inv, sumsy[:degree+1])

y_pred = 0
for ind, i in enumerate(coeff):
    y_pred += i*x**ind

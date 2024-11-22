export default function Calculator(){
    //to be imported
    var insured_amount = 120000
    var income = 13000

    //temp variables
    var year = 0
    var expense = 0.5*income

    var total_amount = insured_amount
    var interest = 0.1*total_amount

 
while (total_amount >0){
    total_amount+=interest
    total_amount -= expense
    expense+=0.6*expense
    year+=1
}
return year
}
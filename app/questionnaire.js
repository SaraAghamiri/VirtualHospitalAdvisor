
function calculateScore(){


let severity =
Number(document.getElementById("severity").value);


let urgency =
Number(document.getElementById("urgency").value);


let frequency =
Number(document.getElementById("frequency").value);



if(!severity || !urgency || !frequency){

alert("Please enter all scores");

return;

}



// PPS equation
// ((Severity*0.5)+(Urgency*0.3)+(Frequency*0.2))*20


let PPS =
(
(severity*0.5)
+
(urgency*0.3)
+
(frequency*0.2)
)
*20;



let selected=[];


document
.querySelectorAll(
'input[name="pain"]:checked'
)
.forEach(
(item)=>{
selected.push(item.value);
}
);



let result=document.getElementById("result");



result.innerHTML=`

<h2>Assessment Result</h2>


<h3>Selected Organizational Pains:</h3>

<ul>

${selected.map(
pain=>`<li>${pain}</li>`
).join("")}

</ul>


<h3>Pain Priority Score</h3>

<p>
<strong>${PPS.toFixed(1)} / 100</strong>
</p>


<p>
Higher scores indicate greater urgency
and strategic importance.
</p>


`;



}
const Name = document.getElementById('Name');
const price = document.getElementById('price');
const amount = document.getElementById('amount');
const Total = document.getElementById('Total');
const isimInput = document.getElementById('isim-input');

let operationNumber = 0;
let editRowIndex = null;

function calculateTotal() {
  const priceValue = parseFloat(price.value);
  const amountValue = parseFloat(amount.value);

  if (!isNaN(priceValue) && !isNaN(amountValue)) {
    Total.value = (priceValue * amountValue).toFixed(2);
  } else {
    Total.value = '';
  }
}

price.addEventListener('input', calculateTotal);
amount.addEventListener('input', calculateTotal);

// Sayfa yüklendiğinde localStorage’dan veriyi yükle
window.addEventListener('load', loadData);

// Kutulara tıklama
document.querySelectorAll(".kutu, .toplam").forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const content = document.getElementById(targetId);
    if (content.classList.contains("active")) {
      content.classList.remove("active");
    } else {
      document.querySelectorAll(".icerik").forEach(div => div.classList.remove("active"));
      content.classList.add("active");
    }
  });
});

// LocalStorage’dan kayıtlı satırları yükle
function loadData() {
  const data = JSON.parse(localStorage.getItem('tableData')) || [];
  const table = document.querySelector('table.td');
  operationNumber = data.length;
  data.forEach((rowData, index) => {
    addTableRow(rowData, index);
  });
  updateTotals(data);
}

// LocalStorage’a kaydet
function saveData() {
  const table = document.querySelector('table.td');
  const data = [];
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    data.push({
      type: row.cells[0].innerText,
      price: row.cells[1].innerText,
      quantity: row.cells[2].innerText,
      totalPrice: row.cells[3].innerText,
      name: row.cells[4].innerText,
      operationNumber: row.cells[5].innerText
    });
  }
  localStorage.setItem('tableData', JSON.stringify(data));
  updateTotals(data);
}

// ✅ Toplamları güncelle
function updateTotals(data) {
  let box1 = 0, box2 = 0, box3 = 0;
  data.forEach(d => {
    const total = parseFloat(d.totalPrice) || 0;
    if (d.type === 'مصاريف الطعام') box2 += total;
    else if (d.type === 'مصاريف اخرة') box3 += total;
    else if (d.type === 'الصندوق') box1 += total;
  });

  const toplamGider = box2 + box3;
  const kalanKasa = box1 - toplamGider;

  document.getElementById('div1').textContent = kalanKasa.toFixed(2);      // الصندوق
  document.getElementById('div2').textContent = box2.toFixed(2);           // مصاريف الطعام
  document.getElementById('div3').textContent = box3.toFixed(2);           // مصاريف اخرة
  if (document.getElementById('div4')) {
    document.getElementById('div4').textContent = toplamGider.toFixed(2);  // جميع المصاريف
  }
}

// Satır ekleme
function addTableRow(rowData, rowIndex) {
  const table = document.querySelector('table.td');
  const newRow = table.insertRow(-1);

  const typeCell = newRow.insertCell(0);
  const priceCell = newRow.insertCell(1);
  const quantityCell = newRow.insertCell(2);
  const totalPriceCell = newRow.insertCell(3);
  const nameCell = newRow.insertCell(4);
  const opNumCell = newRow.insertCell(5);
  const actionCell = newRow.insertCell(6);

  typeCell.innerText = rowData.type;
  priceCell.innerText = rowData.price;
  quantityCell.innerText = rowData.quantity;
  totalPriceCell.innerText = rowData.totalPrice;
  nameCell.innerText = rowData.name;
  opNumCell.innerText = rowData.operationNumber;

  const updateBtn = document.createElement('button');
  updateBtn.innerText = "📝";
  updateBtn.classList.add('row-btn', 'update');
  updateBtn.addEventListener('click', () => {
    editRowIndex = rowIndex;
    isimInput.value = typeCell.innerText;
    price.value = priceCell.innerText;
    amount.value = quantityCell.innerText;
    Total.value = totalPriceCell.innerText;
    Name.value = nameCell.innerText;
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = "🗑️";
  deleteBtn.classList.add('row-btn', 'delete');
  deleteBtn.addEventListener('click', () => {
    table.deleteRow(newRow.rowIndex);
    editRowIndex = null;
    saveData();
  });

  actionCell.appendChild(updateBtn);
  actionCell.appendChild(deleteBtn);
}

// Ekle (create) butonu
document.querySelector(".create").addEventListener("click", function (e) {
  e.preventDefault();

  if (
    isimInput.value.trim() === '' &&
    price.value.trim() === '' &&
    amount.value.trim() === '' &&
    Total.value.trim() === '' &&
    Name.value.trim() === ''
  ) return;

  const totalValue = parseFloat(Total.value) || 0;

  if (editRowIndex !== null) {
    const table = document.querySelector('table.td');
    const row = table.rows[editRowIndex + 1];
    row.cells[0].innerText = isimInput.value;
    row.cells[1].innerText = price.value;
    row.cells[2].innerText = amount.value;
    row.cells[3].innerText = Total.value;
    row.cells[4].innerText = Name.value;
    editRowIndex = null;
  } else {
    operationNumber++;
    addTableRow({
      type: isimInput.value,
      price: price.value,
      quantity: amount.value,
      totalPrice: Total.value,
      name: Name.value,
      operationNumber: operationNumber.toString()
    }, operationNumber - 1);
  }

  saveData();

  isimInput.value = '';
  price.value = '';
  amount.value = '';
  Total.value = '';
  Name.value = '';
});



let expenseChart;









function drawChart(food, other, box) {
  const ctx = document.getElementById('expenseChart').getContext('2d');

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
  
  
    type: 'bar',
    data: {
      labels: ['🍽️ الطعام', '🛒 اخرى', '💰 الصندوق'],
      datasets: [{
        label: '',
        data: [food, other, box],
        backgroundColor: ['#f3a683', '#f7d794', '#63cdda'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }, // Etiket gizle
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y} ل.س`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 10 },
            callback: value => `${value} ل.س`
          }
        },
        x: {
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function updateTotals(data) {
  let box1 = 0, box2 = 0, box3 = 0;
  data.forEach(d => {
    const total = parseFloat(d.totalPrice) || 0;
    if (d.type === 'مصاريف الطعام') box2 += total;
    else if (d.type === 'مصاريف اخرة') box3 += total;
    else if (d.type === 'الصندوق') box1 += total;
  });

  document.getElementById('div1').textContent = (box1 - (box2 + box3)).toFixed(2);
  document.getElementById('div2').textContent = box2.toFixed(2);
  document.getElementById('div3').textContent = box3.toFixed(2);
  document.getElementById('div4').textContent = (box2 + box3).toFixed(2);

  // ⬇️ Grafik çiz
  drawChart(box2, box3, box1);
}

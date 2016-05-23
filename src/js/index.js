$( function(){
    const INITIAL_FOLIO = 1000;
    const INITIAL_ROWS = 3;
    const ROW_ADD_STEP = 1;
    const MAX_ROWS = 10;
    const IVA = 0.16;

    var d = new Date();
    var rowsCount = INITIAL_ROWS;
    var $form = $('#data-form');
    var $inputFolio = $form.find("input[name='folio']");
    var $customer = $form.find("input[name='cliente']");
    var $address = $form.find("input[name='direccion']");
    var $telephone = $form.find("input[name='telefono']");
    var $conditions = $form.find("input[name='condiciones']");
    var $detailTable = $form.find('#detail-table');
    var $tbody = $detailTable.find('tbody');
    var $subtotal = $form.find("input[name='subtotal']");
    var $iva = $form.find("input[name='iva']");
    var $total = $form.find("input[name='total']");
    var $modal = $('#myModal');
    var $modalError = $('#myModal2');
    var $folio = $('#folio-actual');

    String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
    };

    $form.find("input[name='fecha']").val(d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear());

    if(!localStorage.folio) {
        localStorage.folio = INITIAL_FOLIO;
    }

    $inputFolio.val(localStorage.folio);
    addRows(INITIAL_ROWS);

    $form.find('#agregar').on('click','a', function(event) {
        event.preventDefault();
        if(++rowsCount <= MAX_ROWS) {
            addRows(ROW_ADD_STEP);
            if(rowsCount == MAX_ROWS) {
                $(this).css('display', 'none');
            }
        }
    });

    function addRows(rowsNumber) {
        for (var i = 0; i < rowsNumber; i++) {
            var $row =  $('<tr><td class="col-sm-2"><input class="cantidad form-control" type="number"></td>'+
                        '<td class="col-sm-6"><input class="descripcion form-control" type="text"></td>'+
                        '<td class="col-sm-2"><input class="precio form-control" type="text"></td>'+
                        '<td class="col-sm-2"><input class="importe form-control" type="text" readonly></td></tr>');

            $tbody.append($row);
        }
    }

    $detailTable.on('input','td:nth-child(-n+3) input', function(event) {
        var $tr = $(this).closest('tr');
        var quantity = filterFloat($tr.find('input.cantidad').val());
        var $priceInput = $tr.find('input.precio');
        var priceString = $priceInput.val();
        var price = filterFloat(priceString.replace('$ ','').replaceAll(',',''));
        var description = $tr.find('input.descripcion').val();
        var $amountInput = $tr.find('input.importe');
        var amountString = '';
        var validation = ((!isNaN(quantity) && quantity>0) && (!isNaN(price) && price>0) && description != '');

        if(!isNaN(price)) {
            priceString = numberWithCommas(priceString);
            if(!priceString.startsWith('$')) {
                priceString = '$ ' + priceString;
            }

            $priceInput.val(priceString);
        }
        else if(priceString == '$ '){
            $priceInput.val('');
        }

        amountString = parseFloat(Math.round((quantity*price)*100)/100).toFixed(2);
        $amountInput.val(validation ? '$ ' + numberWithCommas(amountString) : '');
        calculateTotals();
    });

    function numberWithCommas(floatNumber) {
        var fString = floatNumber.replace('$ ','').replaceAll(',','');
        var f = parseFloat(fString);
        var int = parseInt(Math.floor(f));
        var intString = int.toString();
        var newIntString = fString.replace(intString,int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

        return newIntString;
    }

    function filterFloat(value) {
        if(/^[0-9]+(\.\d{0,2})?$/.test(value)) {
            return Number(value);
        }

        return NaN;
    }

    function calculateTotals() {
        var $amountInputs = $tbody.find('input.importe');
        var subtotal = 0;
        var iva = 0;
        var total = 0;

        $amountInputs.each(function(index, amountInput) {
            var amount = $(amountInput).val().replace('$ ','').replaceAll(',','');

            if(amount!='') {
                subtotal += parseFloat(amount);
            }
        });

        if(subtotal>0) {
            subtotal = Math.round(subtotal*100)/100;
            iva = Math.round((subtotal*IVA)*100)/100;
            total = Math.round((subtotal+iva)*100)/100;
            $subtotal.val('$ ' + numberWithCommas(subtotal.toFixed(2)));
            $iva.val('$ ' + numberWithCommas(iva.toFixed(2)));
            $total.val('$ ' + numberWithCommas(total.toFixed(2)));
        }
        else {
            $subtotal.val('');
            $iva.val('');
            $total.val('');
        }
    }

    $form.find('#btn-generar').on('click', function(event) {
        if(inputDataIsValid()) {
            $folio.html(localStorage.folio);
            $modal.modal('show');
        }
        else {
            $modalError.modal('show');
        }
    });

    function inputDataIsValid() {
        if($customer.val() != '' && $address.val() != '' && $telephone.val() != '' && $conditions.val() != '' && $total.val() != '') {
            return true;
        }

        return false;
    }

    $('#btn-imprimir').on('click', function(event) {
        var newFolio = parseInt(localStorage.folio)+1;

        $modal.modal('hide');
        window.print();
        localStorage.folio = newFolio;
        $inputFolio.val(localStorage.folio);
        clearInputs();
    });

    $('#btn-cancelar').on('click', function(event) {
        clearInputs();
    });

    function clearInputs() {
        var $inputs = $('.form-horizontal').find('input');

        $inputs.each(function(index, input) {
            if(index>=2 && index < $inputs.length-2) {
                $(input).val('');
            }
        });

        $('html, body').animate({scrollTop : 0},800);
    }
});

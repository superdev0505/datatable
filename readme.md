# Datatable

## This is jquery plugin which can show table with many functions.

#### Requirement

* [jquery](https://code.jquery.com/jquery-3.3.1.js)
* [jquery-ui](https://code.jquery.com/ui/1.12.1/jquery-ui.js)
* [jquery-ui css](http://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css)

#### How to Use

```html
<link rel="stylesheet" type="text/css" href="./assets/css/datatable.css" />
<table id="example">
</table>

<script src="./assets/js/datatable.js"></script>
<script>
$(document).ready(function () {
    var datatable = new DataTable({
        table: '#example',
        ajax: '/datatable/getData.php'
    });
});
</script>
```

#### Datatable Features

* Resize Column Width
* Reorder Column
* Hide / Show Columns
* Get Data by Ajax
* Scrolling Pagination
* Fixed Heaer and Fixed First Column


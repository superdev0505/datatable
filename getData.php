<?php
	$amount = $_POST['limit'];
	$start_pos = $_POST['start_pos'];
	$draw = $_POST['draw'];
	// $filter = $_POST['filter'];
	// $sort = $_POST['sort'];
	$data = array ();
	$link = mysqli_connect('localhost', 'root', '', 'crm');
	if (!$link) {
		die('Could not connect: ' . mysqli_error());
	}
	$sql = "select customer_id, customer_name, customer_company, customer_email, customer_address, customer_phone as count from crm_customers";
	$total = mysqli_query($link, $sql);

	$total_amount = mysqli_num_rows($total);
	
	$sql = "SELECT customer_id, customer_name, customer_company, customer_email, customer_address, customer_phone FROM crm_customers LIMIT ${amount} OFFSET ${start_pos}";
	$result = mysqli_query($link, $sql);
	$amount_result = mysqli_num_rows($result);
	if ($amount_result > 0) {
		while($row = mysqli_fetch_assoc($result)) {
		   array_push($data, $row);
		}
	}

	mysqli_close($link);

	$info = array (
		"total_amount"=> $total_amount,
        "start_point"=> $start_pos,
        "amount_per_page"=> $amount_result
	);

	$fields = array (
		"customer_id"=> "ID",
        "customer_name"=> "Name",
        "customer_company"=> "Company",
        "customer_email"=> "Email",
		"customer_address"=> "Address",
		"customer_phone"=> "Phone"
	);

	$response = array (
		'draw'=>$draw,
		'info'=> $info,
		'fields'=> $fields,
		'data'=> $data
	);

	header('Content-Type: application/json');

	echo json_encode($response);
?>

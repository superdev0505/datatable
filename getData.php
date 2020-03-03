<?php
	$amount = $_POST['limit'];
	$start_pos = $_POST['start_pos'];

	//PHP array containing forenames.
	$names = array(
		'Christopher',
		'Ryan',
		'Ethan',
		'John',
		'Zoey',
		'Sarah',
		'Michelle',
		'Samantha',
	);
	
	//PHP array containing surnames.
	$surnames = array(
		'Walker',
		'Thompson',
		'Anderson',
		'Johnson',
		'Tremblay',
		'Peltier',
		'Cunningham',
		'Simpson',
		'Mercado',
		'Sellers'
	);

	$countries = array(
		'United State',
		'United Kingdom',
		'Australia',
		'New Zealand',
		'Austria',
		'Germany',
		'Brazil',
		'China',
		'Russia',
		'Mexico'
	);

	$info = array (
		"total_amount"=> 10000,
        "start_point"=> 0,
        "amount_per_page"=> 30
	);

	$fields = array (
		"id"=> "ID",
        "first_name"=> "First Name",
        "last_name"=> "Last Name",
        "zipcode"=> "Zipcode",
        "country"=> "Country"
	);

	$data = array ();
	for ($i = 0; $i < $amount; $i ++) {
		$id = rand(1, 1000);
		$first_name = $names[rand(0, 7)];
		$last_name = $surnames[rand(0, 9)];
		$country = $countries[rand(0, 9)];
		$zipcode = rand(10000, 99999);
		$item = array (
			"id"=> $id,
			"first_name"=> $first_name,
			"last_name"=> $last_name,
			"zipcode"=> $zipcode,
			"country"=> $country
		);
		
		array_push($data, $item);
	}

	$response = array (
		'info'=> $info,
		'fields'=> $fields,
		'data'=> $data
	);

	header('Content-Type: application/json');

	echo json_encode($response);
?>

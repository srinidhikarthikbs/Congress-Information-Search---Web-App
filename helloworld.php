<?php 
// error_reporting(0);
// header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
// header("Cache-Control: post-check=0, pre-check=0", false);
// header("Pragma: no-cache");
header('Content-Type: application/json');
?>
<?php
//$domain = "congress.api.sunlightfoundation.com";
$domain = "104.198.0.197:8080";
if(isset($_GET["initial_request"]))
    echo initial_request();
function initial_request(){
    global $domain;
    $results = array();
    $results[0] = json_decode(file_get_contents("http://".$domain."/legislators?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"all", "order"=>"state_name__asc,last_name__asc"))));
    $results[1] = json_decode(file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50", "history.active"=>"true", "last_version.urls.pdf__exists"=>"true", "order"=>"introduced_on__asc"))));
    $results[2] = json_decode(file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50", "history.active"=>"false", "last_version.urls.pdf__exists"=>"true", "order"=>"introduced_on__asc"))));
    $results[3] = json_decode(file_get_contents("http://".$domain."/committees?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"all", "order"=>"committee_id__asc"))));
    return json_encode($results);
}

if(isset($_GET["only_legislators"]))
    echo only_legislators();
function only_legislators(){
    global $domain;
    $leg=FALSE;
    while(!$leg){
        $leg = file_get_contents("http://".$domain."/legislators?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"all", "order"=>"state_name__asc,last_name__asc")));
        if(!json_decode($leg) || !(count(json_decode($leg)->results)>0))
            $leg=FALSE;
    }
    return $leg;
}

if(isset($_GET["only_bills"]))
    echo only_bills();
function only_bills(){
    global $domain;
    $results = array();
    $results[0] = json_decode(file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50", "history.active"=>"true", "last_version.urls.pdf__exists"=>"true", "order"=>"introduced_on__asc"))));
    $results[1] = json_decode(file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50", "history.active"=>"false", "last_version.urls.pdf__exists"=>"true", "order"=>"introduced_on__asc"))));
    return json_encode($results); 
}

if(isset($_GET["only_active_bills"]))
    echo only_active_bills();
function only_active_bills(){
    global $domain;
    $act_bill = FALSE;
    while(!$act_bill){
        $act_bill = file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50", "history.active"=>"true", "last_version.urls.pdf__exists"=>"true", "order"=>"introduced_on__desc")));
        if(!json_decode($act_bill) || !(count(json_decode($act_bill)->results)>0))
            $act_bill=FALSE;
    }
    return $act_bill;
}

if(isset($_GET["only_new_bills"]))
    echo only_new_bills();
function only_new_bills(){
    global $domain;
    $new_bill = FALSE;
    while(!$new_bill){
        $new_bill = file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50", "history.active"=>"false", "last_version.urls.pdf__exists"=>"true", "order"=>"introduced_on__desc")));
        if(!json_decode($new_bill) || !(count(json_decode($new_bill)->results)>0))
            $new_bill=FALSE;
    }
    return $new_bill;
}

if(isset($_GET["only_committees"]))
    echo only_committees();
function only_committees(){
    global $domain;
    $comm=FALSE;
    while(!$comm){
        $comm = file_get_contents("http://".$domain."/committees?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"all", "order"=>"committee_id__asc")));
        if(!json_decode($comm) || !(count(json_decode($comm)->results)>0))
            $comm=FALSE;
    }
    return $comm;
}
//consider writing separate functions for bills and committees (depending on time)
if(isset($_GET["bioguide_id"]))
    echo legislator_bills_committees();
function legislator_bills_committees(){
    global $domain;
    $results=array(); //0-bills 1-committees, although the pdf exists parameter is optional - think about that
    $results[0] = json_decode(file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"5", "sponsor_id"=>$_GET["bioguide_id"]))));
    $results[1] = json_decode(file_get_contents("http://".$domain."/committees?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"5", "member_ids"=>$_GET["bioguide_id"]))));
    return json_encode($results);
}

if(isset($_GET["bioguide_id_bills"]))
    echo bioguide_id_bills();
function bioguide_id_bills(){
    global $domain;
    return file_get_contents("http://".$domain."/bills?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"5", "sponsor_id"=>$_GET["bioguide_id_bills"])));
}

if(isset($_GET["bioguide_id_committees"]))
    echo bioguide_id_committees();
function bioguide_id_committees(){
    global $domain;
    return file_get_contents("http://".$domain."/committees?".http_build_query(array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"5", "member_ids"=>$_GET["bioguide_id_committees"])));
}
/*
if(isset($_GET["operation"])){
    switch ($_GET["operation"]) {
        case 'legislators':
        echo getLegislators();
        break;

        case 'committees':
        echo getCommittees();
        break;
        
        case 'bills':
        echo getBills();
        break;
        
        default:
        $msg = array("err"=>"invalid input");
        echo json_encode($msg);
        break;
    }
}
else {
    $msg = array("err"=>"invalid input");
    echo json_encode($msg);
}

function getLegislators(){
    if(isset($_GET["bills_bioguide_id"])){
        $apiURL = "http://congress.api.sunlightfoundation.com/bills?";
        $params = array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"5", "sponsor_id"=>$_GET["bills_bioguide_id"]);
        $response = file_get_contents($apiURL.http_build_query($params));
        if($decoded_json = json_decode($response)){
            return $response;
        }
        else return json_encode(array("err"=>"server error from legislators"));
    }
    if(isset($_GET["committees_bioguide_id"])){
        $apiURL = "http://congress.api.sunlightfoundation.com/committees?";
        $params = array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"5", "member_ids"=>$_GET["committees_bioguide_id"]);
        $response = file_get_contents($apiURL.http_build_query($params));
        if($decoded_json = json_decode($response)){
            return $response;
        }
        else return json_encode(array("err"=>"server error from legislators"));
    }
    $apiURL = "http://congress.api.sunlightfoundation.com/legislators?";
    $params = array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"all");
    $response = file_get_contents($apiURL.http_build_query($params));
    if($decoded_json = json_decode($response)){
        return $response;
    }
    else return json_encode(array("err"=>"server error from legislators"));
}

function getBills(){
    $apiURL = "http://congress.api.sunlightfoundation.com/bills?";
    $params = array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"50");
    $response = file_get_contents($apiURL.http_build_query($params));
    if($decoded_json = json_decode($response)){
        return $response;
    }
    else return json_encode(array("err"=>"server error from bills"));
}

function getCommittees(){
    $apiURL = "http://congress.api.sunlightfoundation.com/committees?";
    $params = array("apikey"=>"a9050b51c0f14e67a31fe2f6d3f64bc4", "per_page"=>"all");
    $response = file_get_contents($apiURL.http_build_query($params));
    if($decoded_json = json_decode($response)){
        return $response;
    }
    else return json_encode(array("err"=>"server error from committees"));
}
*/
?>

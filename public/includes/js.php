<!-- <?php
function grabJS($root, $nextDir)
{
	echo $nextDir." -> ".$root."<br /><br />";
	chdir($nextDir);
	$files = scandir(getcwd());
	echo "cur = ".getcwd()."<br />";
	foreach($files as &$cur)
	{
		if($cur=="."||$cur=="..")continue;
		echo $cur."<br />";
		if(substr($cur, -3)==".js")
		{
			echo "<script>";
			require $cur;
			echo "</script>";
		}
		else if(compare($cur, ".")==-1)
		{
			grabJS(getcwd(), $cur);
		}
	}
	chdir($root);
}
//grabJS(getcwd(), "includes/js");
?> -->

<!-- Open Source Libraries -->
<script src="includes/js/depend/scroll/Animate.js"></script>
<!-- End Open Source Libraries -->

<!-- Game Specific Code -->
<script src="includes/js/core.js"></script>
<script src="includes/js/depend/canvas.js"></script>
<script src="includes/js/depend/shapes.js"></script>
<script src="includes/js/depend/text.js"></script>
<script src="includes/js/depend/images.js"></script>
<script src="includes/js/depend/animation.js"></script>
<!-- End Game Specific Code -->

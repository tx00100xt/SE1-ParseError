3334
%{
#include "EntitiesMP/StdH/StdH.h"
#include "condition.h"
%}

enum EOperation{
0	EO_SET	"=",
1	EO_ADD  "+",
2	EO_SUBSTRACT "-",
3	EO_MULTIPLY "*",
4	EO_DIVIDE "/",
};

class CPropertyChanger: CEntity {
name      "PropertyChanger";
thumbnail "Thumbnails\\PropertyChanger.tbn";
features  "HasName","IsTargetable", "HasTarget";

properties:
 
  1		CTString		m_strName           "Name" 'N'						= "Property Changer",
  3		CTString		m_strDescription									= "Property Changer",
  4		CTString		m_strProperty		"Target Property to Change"		= "",
  5 	CEntityPointer	m_penTarget			"Target" COLOR(C_RED|0xFF),
  6		BOOL			m_bActive			"Active"						=TRUE,
  //different types start here
  7		CTString		m_strValue			"String Value"					= "",
  8		INDEX			m_iValue			"Integer Value"					= 0,
  9		FLOAT			m_fValue			"Float Value"					= 0,
  10	CTFileName		m_fnValue			"File Name Value"				= CTFILENAME(""),
  11	RANGE			m_rValue			"Range Value"					= 1.0f,
  12	CEntityPointer	m_penValue			"Target Value" COLOR(C_RED|0xFF),
  13	BOOL			m_bValue			"Bool Value"					= FALSE,
  14	COLOR			m_cValue			"Color Value"					= COLOR(C_WHITE|0xFF),
  15	ANIMATION		m_aValue			"Animation Value"				=0,
  16	ANGLE			m_anValue			"Angle Value" =0,
  17	ANGLE3D			m_an3dValue			"Angle 3D Value"=ANGLE3D(0,0,0),
  18	enum			EOperation m_eOperation		"Operation"		=EO_SET,
  19	BOOL			m_bDebug			"Debug Messages"		=FALSE,
  20    CEntityPointer  m_penSource			"Source Target"			,
  21	CTString		m_strSource			"Source Property"		="",
  22	enum			EConType	m_ePT	"Target Property Type" =ECT_ENTITY,
  23	BOOL			m_bCaused1			"Source Target=penCaused" =FALSE,
  24	BOOL			m_bCaused2			"Target=penCaused" =FALSE,
components:

  1 model   MODEL_MARKER     "ModelsMP\\Editor\\PropertyChanger.mdl",
  2 texture TEXTURE_MARKER   "TexturesMP\\Detail\\White.tex",


functions:

  const CTString &GetDescription(void) const{
    return m_strDescription;
  }

   
  BOOL HandleEvent(const CEntityEvent &ee) { 

	  if (ee.ee_slEvent==EVENTCODE_ETrigger) {

		  if(m_bActive){
			  ETrigger eTrigger = ((ETrigger &) ee);
			  if(m_bCaused2&&eTrigger.penCaused){
				  m_penTarget=eTrigger.penCaused;
			  }
			  if(m_penTarget){
				  if(m_penTarget->PropertyForName(m_strProperty)==NULL) { 
					  if(m_bDebug){
						  CPrintF(TRANS("%s : %s Not Found\n"),m_strName,m_strProperty);
					  }
				  }else{
					  if(m_ePT==ECT_ENTITY){
						  SLONG offset=m_penTarget->PropertyForName(m_strProperty)->ep_slOffset; 

						  //FLOAT

						 if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  FLOAT *fValue= ((FLOAT *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  FLOAT fOld=*fValue;
							  FLOAT *fNew=&m_fValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)!=NULL){
								  if(m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
									  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
									  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
								  }
								  else if(m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
									  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
									  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
								  }
								  }else if(m_bDebug){
								  CPrintF(TRANS("%s:Source Property %s not found\n"),GetName(),m_strSource);
							  }
								  //if(*fValue!=NULL){
								  if(m_eOperation==EO_SET){
									  *fValue=*fNew;
								  }else if(m_eOperation==EO_ADD){
									  *fValue+=*fNew;
								  }else if(m_eOperation==EO_SUBSTRACT){
									  *fValue-=*fNew;
								  }else if(m_eOperation==EO_MULTIPLY){
									  *fValue*=*fNew;
								  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
									  *fValue/=*fNew;
								  }else{
									  if(m_bDebug){
										  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
									  }
								  }
								  
							  //}

							  //Pointer
							  

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::EPT_ENTITYPTR){
							  CEntityPointer *penPointer=((CEntityPointer *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  CEntityPointer penOld=*penPointer;
							  CEntityPointer *penNew=&m_penValue;
							  
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)!=NULL&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_ENTITYPTR){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  penNew=((CEntityPointer *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  if(m_bCaused1&&eTrigger.penCaused){
								  penNew=&eTrigger.penCaused;
							  }

							  *penPointer= *penNew;

							  if(m_bDebug){
								  CTString str1="NULL",str2="NULL";
								  if(penOld){
									  str1=((CEntity&)*penOld).GetName();
								  }
								  if(*penNew){
									  str2=((CEntity&)*penNew).GetName();
								  }
								  CPrintF(TRANS("%s changing Pointer %s from %s to %s\n"),m_strName,m_strProperty,str1,str2);
							  }
							  //INDEX

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty:: EPT_INDEX){
							  INDEX *iValue=((INDEX *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  INDEX iOld=*iValue;
							  INDEX *iNew=&m_iValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  iNew=((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
								  *iNew=*((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
							  }
							  if(m_eOperation==EO_SET){
								  *iValue=*iNew;
							  }else if(m_eOperation==EO_ADD){
								  *iValue+=*iNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *iValue-=*iNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *iValue*=*iNew;
							  }else if(m_eOperation==EO_DIVIDE&&m_iValue!=0){
								  *iValue/=*iNew;
							  }else{
								  if(m_bDebug){
									  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
								  }
							  }
							  if(m_bDebug){
								  CPrintF(TRANS("%s: Target Entity Property: %s.%s is currently (INDEX)%d\n"),m_strName,((CEntity&)*m_penTarget).GetName(),m_strProperty,iOld);
								  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
									  CPrintF(TRANS("%s: Source Entity Property: %s.%s is currently (INDEX)%d\n"),m_strName,((CEntity&)*m_penSource).GetName(),m_strSource,*iNew);
								  }else{
									  CPrintF(TRANS("%s: Source Value: (INDEX)%d\n"),m_strName,m_iValue);
								  }
								  if(m_eOperation==EO_SET){
									  CPrintF(TRANS("%s: %s=(INDEX)%d\n"),m_strName,m_strProperty,*iValue);
								  }else if(m_eOperation==EO_ADD){
									  CPrintF(TRANS("%s: %s=(INDEX)%d+(INDEX)%d="),m_strName,m_strProperty,((CEntity&)*m_penTarget).GetName(),*iNew);
									  CPrintF(TRANS("%d\n"),*iValue);
								  }else if(m_eOperation==EO_SUBSTRACT){
									  CPrintF(TRANS("%s: %s=(INDEX)%d-(INDEX)%d="),m_strName,m_strProperty,((CEntity&)*m_penTarget).GetName(),*iNew);
									  CPrintF(TRANS("%d\n"),*iValue);
								  }else if(m_eOperation==EO_MULTIPLY){
									  CPrintF(TRANS("%s: %s=(INDEX)%d*(INDEX)%d="),m_strName,m_strProperty,((CEntity&)*m_penTarget).GetName(),*iNew);
									  CPrintF(TRANS("%d\n"),*iValue);
								  }else if(m_eOperation==EO_DIVIDE&&m_iValue!=0){
									  CPrintF(TRANS("%s: %s=(INDEX)%d/(INDEX)%d="),m_strName,m_strProperty,((CEntity&)*m_penTarget).GetName(),*iNew);
									  CPrintF(TRANS("%d\n"),*iValue);
								  }
							  }
							  //BOOL

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::  EPT_BOOL){
							  BOOL *bValue=((BOOL *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  BOOL *bNew=&m_bValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_BOOL){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  bNew=((BOOL *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  if(m_eOperation==EO_MULTIPLY){
								  *bValue=!bValue;
							  }else{
								  *bValue= *bNew;
							  }
							  //COLOR

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::  EPT_COLOR){
							  COLOR *cValue=((COLOR *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  COLOR *cNew=&m_cValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_COLOR){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  cNew=((COLOR *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  *cValue= *cNew;

							  //String

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::  EPT_STRING){
							  CTString *strValue=((CTString *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  CTString *strNew=&m_strValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_STRING){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  strNew=((CTString *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  if(m_eOperation==EO_ADD){
								  *strValue+=*strNew;
							  }else{
								  *strValue= *strNew;
							  }
							  //Range

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::  EPT_RANGE){
							  RANGE *rValue=((RANGE *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  RANGE *rNew=&m_rValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_RANGE){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  rNew=((RANGE *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  if(m_eOperation==EO_SET){
								  *rValue=*rNew;
							  }else if(m_eOperation==EO_ADD){
								  *rValue+=*rNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *rValue-=*rNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *rValue*=*rNew;
							  }else if(m_eOperation==EO_DIVIDE&&m_rValue!=0){
								  *rValue/=*rNew;
							  }else{
								  if(m_bDebug){
									  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
								  }
							  }

							  //Filename

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::  EPT_FILENAME){
							  CTFileName *fnValue=((CTFileName *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  CTFileName *fnNew=&m_fnValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FILENAME){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  fnNew=((CTFileName *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  *fnValue= *fnNew;

							  //Animation

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::   EPT_ANIMATION){
							  ANIMATION *aValue=((ANIMATION *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  ANIMATION *aNew=&m_aValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_ANIMATION){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  aNew=((ANIMATION *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  *aValue= *aNew;

							  //Angle

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::   EPT_ANGLE){
							  ANGLE *anValue=((ANGLE *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  ANGLE *anNew=&m_anValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_ANGLE){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  anNew=((ANGLE *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  if(m_eOperation==EO_SET){
								  *anValue=*anNew;
							  }else if(m_eOperation==EO_ADD){
								  *anValue+=*anNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *anValue-=*anNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *anValue*=*anNew;
							  }else if(m_eOperation==EO_DIVIDE&&m_anValue!=0){
								  *anValue/=*anNew;
							  }else{
								  if(m_bDebug){
									  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
								  }
							  }

							  //ANGLE3D

						  }else if(m_penTarget->PropertyForName(m_strProperty)->ep_eptType==CEntityProperty::   EPT_ANGLE3D){
							  ANGLE3D *an3dValue=((ANGLE3D *)(((UBYTE *)(CEntity*) m_penTarget.ep_pen)+offset)); 
							  ANGLE3D *anNew=&m_an3dValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_ANGLE3D){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  anNew=((ANGLE3D *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  if(m_eOperation==EO_ADD){
								  *an3dValue+=*anNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *an3dValue-=*anNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *an3dValue*=*anNew;
							  }else {
								  *an3dValue=*anNew;
							  }

						  }
					  }else if(m_ePT==ECT_POSX){
						  FLOAT *fValue= &((CEntity&)*m_penTarget).en_plPlacement.pl_PositionVector(1); 
						  FLOAT fOld=*fValue;
						  FLOAT *fNew=&m_fValue;
						  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						  }
						  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						  }
						  //if(*fValue!=NULL){
						  if(m_eOperation==EO_SET){
							  *fValue=*fNew;
						  }else if(m_eOperation==EO_ADD){
							  *fValue+=*fNew;
						  }else if(m_eOperation==EO_SUBSTRACT){
							  *fValue-=*fNew;
						  }else if(m_eOperation==EO_MULTIPLY){
							  *fValue*=*fNew;
						  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							  *fValue/=*fNew;
						  }else{
							  if(m_bDebug){
								  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							  }
						  }
					  }else if(m_ePT==ECT_POSY){
						  FLOAT *fValue= &((CEntity&)*m_penTarget).en_plPlacement.pl_PositionVector(2); 
						  FLOAT fOld=*fValue;
						  FLOAT *fNew=&m_fValue;
						  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						  }
						  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						  }
						  //if(*fValue!=NULL){
						  if(m_eOperation==EO_SET){
							  *fValue=*fNew;
						  }else if(m_eOperation==EO_ADD){
							  *fValue+=*fNew;
						  }else if(m_eOperation==EO_SUBSTRACT){
							  *fValue-=*fNew;
						  }else if(m_eOperation==EO_MULTIPLY){
							  *fValue*=*fNew;
						  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							  *fValue/=*fNew;
						  }else{
							  if(m_bDebug){
								  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							  }
						  }
					  }else if(m_ePT==ECT_POSZ){
						  FLOAT *fValue= &((CEntity&)*m_penTarget).en_plPlacement.pl_PositionVector(3); 
						  FLOAT fOld=*fValue;
						  FLOAT *fNew=&m_fValue;
						  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						  }
						  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						  }
						  //if(*fValue!=NULL){
						  if(m_eOperation==EO_SET){
							  *fValue=*fNew;
						  }else if(m_eOperation==EO_ADD){
							  *fValue+=*fNew;
						  }else if(m_eOperation==EO_SUBSTRACT){
							  *fValue-=*fNew;
						  }else if(m_eOperation==EO_MULTIPLY){
							  *fValue*=*fNew;
						  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							  *fValue/=*fNew;
						  }else{
							  if(m_bDebug){
								  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							  }
						  }
					  }else if(m_ePT==ECT_ROTH){
						  FLOAT *fValue= &((CEntity&)*m_penTarget).en_plPlacement.pl_OrientationAngle(1); 
						  FLOAT fOld=*fValue;
						  FLOAT *fNew=&m_fValue;
						  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						  }
						  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						  }
						  //if(*fValue!=NULL){
						  if(m_eOperation==EO_SET){
							  *fValue=*fNew;
						  }else if(m_eOperation==EO_ADD){
							  *fValue+=*fNew;
						  }else if(m_eOperation==EO_SUBSTRACT){
							  *fValue-=*fNew;
						  }else if(m_eOperation==EO_MULTIPLY){
							  *fValue*=*fNew;
						  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							  *fValue/=*fNew;
						  }else{
							  if(m_bDebug){
								  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							  }
						  }
					  }else if(m_ePT==ECT_ROTP){
						  FLOAT *fValue= &((CEntity&)*m_penTarget).en_plPlacement.pl_OrientationAngle(2); 
						  FLOAT fOld=*fValue;
						  FLOAT *fNew=&m_fValue;
						  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						  }
						  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						  }
						  //if(*fValue!=NULL){
						  if(m_eOperation==EO_SET){
							  *fValue=*fNew;
						  }else if(m_eOperation==EO_ADD){
							  *fValue+=*fNew;
						  }else if(m_eOperation==EO_SUBSTRACT){
							  *fValue-=*fNew;
						  }else if(m_eOperation==EO_MULTIPLY){
							  *fValue*=*fNew;
						  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							  *fValue/=*fNew;
						  }else{
							  if(m_bDebug){
								  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							  }
						  }
					  }else if(m_ePT==ECT_ROTB){
						  FLOAT *fValue= &((CEntity&)*m_penTarget).en_plPlacement.pl_OrientationAngle(3); 
						  FLOAT fOld=*fValue;
						  FLOAT *fNew=&m_fValue;
						  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						  }
						  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						  }
						  //if(*fValue!=NULL){
						  if(m_eOperation==EO_SET){
							  *fValue=*fNew;
						  }else if(m_eOperation==EO_ADD){
							  *fValue+=*fNew;
						  }else if(m_eOperation==EO_SUBSTRACT){
							  *fValue-=*fNew;
						  }else if(m_eOperation==EO_MULTIPLY){
							  *fValue*=*fNew;
						  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							  *fValue/=*fNew;
						  }else{
							  if(m_bDebug){
								  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							  }
						  }
				      }else if(m_penTarget->GetFlags()&ENF_ALIVE&&m_ePT==ECT_HEALTH){
						FLOAT fValue= ((CLiveEntity&)*m_penTarget).en_fHealth;
						FLOAT fOld=fValue;
						FLOAT *fNew=&m_fValue;
						if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
							SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
							*fNew=*((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
						}
						else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
							SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
							*fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
						}
						//if(*fValue!=NULL){
						if(m_eOperation==EO_SET){
							((CLiveEntity&)*m_penTarget).SetHealth(*fNew);
						}else if(m_eOperation==EO_ADD){
							((CLiveEntity&)*m_penTarget).SetHealth(fValue+*fNew);
						}else if(m_eOperation==EO_SUBSTRACT){
							((CLiveEntity&)*m_penTarget).SetHealth(fValue-*fNew);
						}else if(m_eOperation==EO_MULTIPLY){
							((CLiveEntity&)*m_penTarget).SetHealth(fValue * *fNew);
						}else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
							((CLiveEntity&)*m_penTarget).SetHealth(fValue / *fNew);
						}else{
							if(m_bDebug){
								CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
							}
						}
					  }else if(IsDerivedFromClass(m_penTarget,"MovableEntity")){
						  if(m_ePT==ECT_SPEEDX){
							  FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(1); 
							  FLOAT fOld=*fValue;
							  FLOAT *fNew=&m_fValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  *fNew=*((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
								  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
							  }
							  //if(*fValue!=NULL){
							  if(m_eOperation==EO_SET){
								  *fValue=*fNew;
							  }else if(m_eOperation==EO_ADD){
								  *fValue+=*fNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *fValue-=*fNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *fValue*=*fNew;
							  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
								  *fValue/=*fNew;
							  }else{
								  if(m_bDebug){
									  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
								  }
							  }
							  ((CMovableEntity&)*m_penTarget).AddToMovers();
						  }else if(m_ePT==ECT_SPEEDY){
							  FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(2); 
							  FLOAT fOld=*fValue;
							  FLOAT *fNew=&m_fValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
							  }
							  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
								  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
							  }
							  //if(*fValue!=NULL){
							  if(m_eOperation==EO_SET){
								  *fValue=*fNew;
							  }else if(m_eOperation==EO_ADD){
								  *fValue+=*fNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *fValue-=*fNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *fValue*=*fNew;
							  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
								  *fValue/=*fNew;
							  }else{
								  if(m_bDebug){
									  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
								  }
							  }
							  ((CMovableEntity&)*m_penTarget).AddToMovers();

						  }else if(m_ePT==ECT_SPEEDZ){
							  FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(3); 
							  FLOAT fOld=*fValue;
							  FLOAT *fNew=&m_fValue;
							  if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
								  fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
									}
							  else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
								  SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
								  *fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
									}
							  //if(*fValue!=NULL){
							  if(m_eOperation==EO_SET){
								  *fValue=*fNew;
							  }else if(m_eOperation==EO_ADD){
								  *fValue+=*fNew;
							  }else if(m_eOperation==EO_SUBSTRACT){
								  *fValue-=*fNew;
							  }else if(m_eOperation==EO_MULTIPLY){
								  *fValue*=*fNew;
							  }else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
								  *fValue/=*fNew;
							  }else{
								  if(m_bDebug){
									  CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
								  }
							  }
							  ((CMovableEntity&)*m_penTarget).AddToMovers();
						  }if(m_ePT==ECT_SPEEDX){
								FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vCurrentTranslationAbsolute(1); 
								FLOAT fOld=*fValue;
								FLOAT *fNew=&m_fValue;
								if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
									fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
								}
								else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
									*fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
								}
								//if(*fValue!=NULL){
								if(m_eOperation==EO_SET){
									*fValue=*fNew;
								}else if(m_eOperation==EO_ADD){
									*fValue+=*fNew;
								}else if(m_eOperation==EO_SUBSTRACT){
									*fValue-=*fNew;
								}else if(m_eOperation==EO_MULTIPLY){
									*fValue*=*fNew;
								}else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
									*fValue/=*fNew;
								}else{
									if(m_bDebug){
										CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
									}
								}
								((CMovableEntity&)*m_penTarget).AddToMovers();
							}else if(m_ePT==ECT_SPEEDXREL){
								FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vDesiredTranslationRelative(1); 
								FLOAT fOld=*fValue;
								FLOAT *fNew=&m_fValue;
								if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
									fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
								}
								else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
									*fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
								}
								//if(*fValue!=NULL){
								if(m_eOperation==EO_SET){
									*fValue=*fNew;
								}else if(m_eOperation==EO_ADD){
									*fValue+=*fNew;
								}else if(m_eOperation==EO_SUBSTRACT){
									*fValue-=*fNew;
								}else if(m_eOperation==EO_MULTIPLY){
									*fValue*=*fNew;
								}else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
									*fValue/=*fNew;
								}else{
									if(m_bDebug){
										CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
									}
								}
								((CMovableEntity&)*m_penTarget).AddToMovers();
							}else if(m_ePT==ECT_SPEEDYREL){
								FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vDesiredTranslationRelative(2); 
								FLOAT fOld=*fValue;
								FLOAT *fNew=&m_fValue;
								if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
									fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
								}
								else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
									*fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
								}
								//if(*fValue!=NULL){
								if(m_eOperation==EO_SET){
									*fValue=*fNew;
								}else if(m_eOperation==EO_ADD){
									*fValue+=*fNew;
								}else if(m_eOperation==EO_SUBSTRACT){
									*fValue-=*fNew;
								}else if(m_eOperation==EO_MULTIPLY){
									*fValue*=*fNew;
								}else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
									*fValue/=*fNew;
								}else{
									if(m_bDebug){
										CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
									}
								}
								((CMovableEntity&)*m_penTarget).AddToMovers();
							}else if(m_ePT==ECT_SPEEDXREL){
								FLOAT *fValue= &((CMovableEntity&)*m_penTarget).en_vDesiredTranslationRelative(3); 
								FLOAT fOld=*fValue;
								FLOAT *fNew=&m_fValue;
								if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_FLOAT){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset; 
									fNew=((FLOAT *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1)); 
								}
								else if(m_penSource&&m_penSource->PropertyForName(m_strSource)->ep_eptType==CEntityProperty::EPT_INDEX){
									SLONG offset1=m_penSource->PropertyForName(m_strSource)->ep_slOffset;
									*fNew=*((INDEX *)(((UBYTE *)(CEntity*) m_penSource.ep_pen)+offset1));
								}
								//if(*fValue!=NULL){
								if(m_eOperation==EO_SET){
									*fValue=*fNew;
								}else if(m_eOperation==EO_ADD){
									*fValue+=*fNew;
								}else if(m_eOperation==EO_SUBSTRACT){
									*fValue-=*fNew;
								}else if(m_eOperation==EO_MULTIPLY){
									*fValue*=*fNew;
								}else if(m_eOperation==EO_DIVIDE&&m_fValue!=0){
									*fValue/=*fNew;
								}else{
									if(m_bDebug){
										CPrintF(TRANS("%s: DO NOT DIVIDE THROUGH 0!\n"),m_strName);
									}
								}
								((CMovableEntity&)*m_penTarget).AddToMovers();
							}
					  }
				  } 
			  }
		  }
	  } 
	  if (ee.ee_slEvent==EVENTCODE_EActivate) {
		  m_bActive=TRUE;
	  }
	  if (ee.ee_slEvent==EVENTCODE_EDeactivate) {
		  m_bActive=FALSE;
	  }
	  return CEntity::HandleEvent(ee); 
  }

procedures:

  Main()
  {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    return;
  }
};

/*   

  ---------Things to fix----------
  Floating property
  Lights-update shadowmaps?
  sound holder?
  range?
  Mirror?
  model sizes?
  World Link? ---CTFileNameNoDep?
*/
